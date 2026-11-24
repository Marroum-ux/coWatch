-- ============================================================
-- Tests des clés et relations F04 (playlist) et F05 (historique) – membre 4
-- Carte Trello 4.2 – vérifie le schema.sql actuel de main, sans le modifier
--
-- Utilisation : pgAdmin > base cowatch > Query Tool > ouvrir ce fichier > Execute.
-- Tout se passe dans une transaction annulée à la fin (ROLLBACK) :
-- la base n'est pas modifiée.
-- Résultat attendu : « TOUTES LES RELATIONS F04/F05 SONT CORRECTES »
-- dans l'onglet Messages.
-- ============================================================

BEGIN;

DO $$
DECLARE
    nb INTEGER;
    regle CHAR;
    attendu RECORD;
BEGIN
    -- ---------------------------------------------------------
    -- PARTIE A : les clés étrangères existent avec le bon ON DELETE
    -- confdeltype : 'c' = CASCADE, 'a' = NO ACTION (suppression refusée)
    -- ---------------------------------------------------------
    FOR attendu IN
        SELECT * FROM (VALUES
            ('playlist',           'salon',         'c', 'playlist -> salon : CASCADE'),
            ('historique',         'salon',         'c', 'historique -> salon : CASCADE'),
            ('element_playlist',   'playlist',      'c', 'element_playlist -> playlist : CASCADE'),
            ('element_playlist',   'video_youtube', 'a', 'element_playlist -> video_youtube : NO ACTION'),
            ('element_historique', 'historique',    'c', 'element_historique -> historique : CASCADE'),
            ('element_historique', 'video_youtube', 'a', 'element_historique -> video_youtube : NO ACTION')
        ) AS t(source, cible, regle_attendue, libelle)
    LOOP
        SELECT c.confdeltype INTO regle
          FROM pg_constraint c
         WHERE c.contype = 'f'
           AND c.conrelid  = attendu.source::regclass
           AND c.confrelid = attendu.cible::regclass;
        ASSERT regle IS NOT NULL, 'ECHEC A - clé étrangère absente : ' || attendu.libelle;
        ASSERT regle = attendu.regle_attendue, 'ECHEC A - mauvais ON DELETE : ' || attendu.libelle;
        RAISE NOTICE 'OK A - %', attendu.libelle;
    END LOOP;

    -- Données de départ : deux salons créés comme le fait salonService.creerSalon()
    INSERT INTO salon (id_salle, code_invitation) VALUES ('salon-A', 'codeA'), ('salon-B', 'codeB');
    INSERT INTO playlist (id_salle) VALUES ('salon-A'), ('salon-B');
    INSERT INTO historique (id_salle) VALUES ('salon-A'), ('salon-B');
    INSERT INTO participant_salon (id_salle, id_participant, pseudonyme, est_createur)
      VALUES ('salon-A', 'p1', 'Maram', TRUE), ('salon-A', 'p2', 'Farah', FALSE);
    INSERT INTO video_youtube (id_youtube, titre, url) VALUES
      ('dQw4w9WgXcQ', 'Vidéo 1', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      ('9bZkp7q19f0', 'Vidéo 2', 'https://www.youtube.com/watch?v=9bZkp7q19f0');

    -- ---------------------------------------------------------
    -- PARTIE B : comportements
    -- ---------------------------------------------------------

    -- B1. Un salon sans ligne dans playlist ne peut pas recevoir de vidéo
    --     -> la création du salon (membre 1) DOIT créer playlist et historique.
    INSERT INTO salon (id_salle, code_invitation) VALUES ('salon-incomplet', 'codeX');
    BEGIN
        INSERT INTO element_playlist (id_salle, id_youtube, position)
          VALUES ('salon-incomplet', 'dQw4w9WgXcQ', 1);
        RAISE EXCEPTION 'ECHEC B1 - vidéo ajoutée à un salon sans playlist';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'OK B1 - un salon doit avoir sa ligne playlist (créée par salonService)';
    END;

    -- B2. Une même vidéo peut être dans les playlists de plusieurs salons
    INSERT INTO element_playlist (id_salle, id_youtube, position) VALUES
      ('salon-A', 'dQw4w9WgXcQ', 1),
      ('salon-B', 'dQw4w9WgXcQ', 1);
    RAISE NOTICE 'OK B2 - une vidéo partagée entre plusieurs salons';

    -- B3. Une même vidéo peut apparaître 2 fois dans une playlist (positions différentes)
    --     -> la suppression (carte 4.8) se fait par id_element, pas par id_youtube.
    INSERT INTO element_playlist (id_salle, id_youtube, position) VALUES ('salon-A', 'dQw4w9WgXcQ', 2);
    SELECT count(*) INTO nb FROM element_playlist WHERE id_salle = 'salon-A' AND id_youtube = 'dQw4w9WgXcQ';
    ASSERT nb = 2, 'ECHEC B3 - doublon de vidéo refusé';
    RAISE NOTICE 'OK B3 - doublon possible : supprimer par id_element';

    -- B4. Retirer une vidéo de la playlist ne touche ni le catalogue ni l'historique
    INSERT INTO element_historique (id_salle, id_youtube) VALUES ('salon-A', 'dQw4w9WgXcQ');
    DELETE FROM element_playlist WHERE id_salle = 'salon-A' AND id_youtube = 'dQw4w9WgXcQ';
    SELECT count(*) INTO nb FROM element_historique WHERE id_salle = 'salon-A';
    ASSERT nb = 1, 'ECHEC B4 - historique modifié par la suppression dans la playlist';
    SELECT count(*) INTO nb FROM video_youtube WHERE id_youtube = 'dQw4w9WgXcQ';
    ASSERT nb = 1, 'ECHEC B4 - vidéo supprimée du catalogue';
    RAISE NOTICE 'OK B4 - retrait de la playlist : historique et catalogue intacts';

    -- B5. Le départ d'un participant ne touche pas l'historique (RG07)
    DELETE FROM participant_salon WHERE id_salle = 'salon-A' AND id_participant = 'p2';
    SELECT count(*) INTO nb FROM element_historique WHERE id_salle = 'salon-A';
    ASSERT nb = 1, 'ECHEC B5 - historique perdu après le départ d''un participant';
    RAISE NOTICE 'OK B5 - historique conservé après le départ d''un participant (RG07)';

    -- B6. Une vidéo présente dans un historique ne peut pas être supprimée du catalogue
    BEGIN
        DELETE FROM video_youtube WHERE id_youtube = 'dQw4w9WgXcQ';
        RAISE EXCEPTION 'ECHEC B6 - vidéo de l''historique supprimée';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'OK B6 - vidéo protégée tant qu''elle est utilisée';
    END;

    -- B7. Une vidéo plus utilisée nulle part peut être supprimée du catalogue
    DELETE FROM video_youtube WHERE id_youtube = '9bZkp7q19f0';
    RAISE NOTICE 'OK B7 - vidéo inutilisée supprimable';

    -- B8. Supprimer un salon efface en chaîne : playlist + éléments, historique + éléments
    DELETE FROM salon WHERE id_salle = 'salon-A';
    SELECT (SELECT count(*) FROM playlist           WHERE id_salle = 'salon-A')
         + (SELECT count(*) FROM element_playlist   WHERE id_salle = 'salon-A')
         + (SELECT count(*) FROM historique         WHERE id_salle = 'salon-A')
         + (SELECT count(*) FROM element_historique WHERE id_salle = 'salon-A') INTO nb;
    ASSERT nb = 0, 'ECHEC B8 - données du salon A restantes';
    RAISE NOTICE 'OK B8 - suppression d''un salon en cascade sur 2 niveaux';

    -- B9. Les autres salons ne sont pas touchés
    SELECT count(*) INTO nb FROM element_playlist WHERE id_salle = 'salon-B';
    ASSERT nb = 1, 'ECHEC B9 - playlist du salon B touchée';
    RAISE NOTICE 'OK B9 - salon B intact';

    RAISE NOTICE '>>> TOUTES LES RELATIONS F04/F05 SONT CORRECTES <<<';
END $$;

ROLLBACK;
