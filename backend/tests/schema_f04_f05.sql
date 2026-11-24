-- ============================================================
-- Tests des tables F04 (playlist) et F05 (historique) – membre 4
-- Carte Trello 4.1 – vérifie les tables existantes du schema.sql de main
--
-- Utilisation : pgAdmin > base cowatch > Query Tool > ouvrir ce fichier > Execute.
-- Tout se passe dans une transaction annulée à la fin (ROLLBACK) :
-- la base n'est pas modifiée.
-- Résultat attendu : un message « TOUS LES TESTS F04/F05 PASSENT »
-- dans l'onglet Messages. Sinon, l'erreur indique le test qui échoue.
-- ============================================================

BEGIN;

DO $$
DECLARE
    nb INTEGER;
    ordre TEXT;
BEGIN
    -- Données de départ : un salon créé comme le fait salonService.creerSalon()
    INSERT INTO salon (id_salle, code_invitation) VALUES ('salon-test-A', 'codeA');
    INSERT INTO playlist (id_salle) VALUES ('salon-test-A');
    INSERT INTO historique (id_salle) VALUES ('salon-test-A');

    INSERT INTO salon (id_salle, code_invitation) VALUES ('salon-test-B', 'codeB');
    INSERT INTO playlist (id_salle) VALUES ('salon-test-B');
    INSERT INTO historique (id_salle) VALUES ('salon-test-B');

    -- 1. Vidéos (la miniature se déduit de l'identifiant : https://i.ytimg.com/vi/<id>/hqdefault.jpg)
    INSERT INTO video_youtube (id_youtube, titre, url) VALUES
      ('dQw4w9WgXcQ', 'Vidéo 1', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      ('9bZkp7q19f0', 'Vidéo 2', 'https://www.youtube.com/watch?v=9bZkp7q19f0'),
      ('kJQP7kiw5Fk', 'Vidéo 3', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk');
    RAISE NOTICE 'OK 1 - vidéos enregistrées';

    -- 2. Playlist ordonnée : positions 1, 2, 3
    INSERT INTO element_playlist (id_salle, id_youtube, position) VALUES
      ('salon-test-A', 'dQw4w9WgXcQ', 1),
      ('salon-test-A', '9bZkp7q19f0', 2),
      ('salon-test-A', 'kJQP7kiw5Fk', 3);
    SELECT string_agg(id_youtube, ',' ORDER BY position) INTO ordre
      FROM element_playlist WHERE id_salle = 'salon-test-A';
    ASSERT ordre = 'dQw4w9WgXcQ,9bZkp7q19f0,kJQP7kiw5Fk', 'ECHEC 2 - ordre de la playlist incorrect';
    RAISE NOTICE 'OK 2 - playlist dans le bon ordre';

    -- 3. Suppression d'une vidéo sans décaler les positions, ajout à MAX(position) + 1
    DELETE FROM element_playlist WHERE id_salle = 'salon-test-A' AND position = 2;
    INSERT INTO element_playlist (id_salle, id_youtube, position)
      SELECT 'salon-test-A', '9bZkp7q19f0', COALESCE(MAX(position), 0) + 1
      FROM element_playlist WHERE id_salle = 'salon-test-A';
    SELECT string_agg(id_youtube, ',' ORDER BY position) INTO ordre
      FROM element_playlist WHERE id_salle = 'salon-test-A';
    ASSERT ordre = 'dQw4w9WgXcQ,kJQP7kiw5Fk,9bZkp7q19f0', 'ECHEC 3 - ordre après suppression/ajout incorrect';
    RAISE NOTICE 'OK 3 - suppression puis ajout en fin de playlist';

    -- 4. Deux vidéos à la même position dans un salon : refusé
    BEGIN
        INSERT INTO element_playlist (id_salle, id_youtube, position)
          VALUES ('salon-test-A', '9bZkp7q19f0', 1);
        RAISE EXCEPTION 'ECHEC 4 - deux vidéos à la même position';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'OK 4 - position en double refusée';
    END;

    -- 5. Une vidéo absente de video_youtube ne peut pas entrer dans une playlist
    BEGIN
        INSERT INTO element_playlist (id_salle, id_youtube, position)
          VALUES ('salon-test-A', 'AAAAAAAAAAA', 9);
        RAISE EXCEPTION 'ECHEC 5 - vidéo inconnue acceptée';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'OK 5 - vidéo inconnue refusée dans la playlist';
    END;

    -- 6. Historique : date de visionnage, du plus récent au plus ancien
    INSERT INTO element_historique (id_salle, id_youtube, date_visionnage) VALUES
      ('salon-test-A', 'dQw4w9WgXcQ', now() - INTERVAL '10 minutes'),
      ('salon-test-A', '9bZkp7q19f0', now() - INTERVAL '5 minutes'),
      ('salon-test-A', 'dQw4w9WgXcQ', now());   -- revue une 2e fois
    INSERT INTO element_historique (id_salle, id_youtube) VALUES ('salon-test-B', 'kJQP7kiw5Fk');
    SELECT string_agg(id_youtube, ',' ORDER BY date_visionnage DESC) INTO ordre
      FROM element_historique WHERE id_salle = 'salon-test-A';
    ASSERT ordre = 'dQw4w9WgXcQ,9bZkp7q19f0,dQw4w9WgXcQ', 'ECHEC 6 - ordre de l''historique incorrect';
    RAISE NOTICE 'OK 6 - historique trié du plus récent au plus ancien';

    -- 7. Chaque salon a son propre historique
    SELECT count(*) INTO nb FROM element_historique WHERE id_salle = 'salon-test-B';
    ASSERT nb = 1, 'ECHEC 7 - historique du salon B incorrect';
    RAISE NOTICE 'OK 7 - historiques séparés par salon';

    -- 8. La date est remplie automatiquement par le serveur
    SELECT count(*) INTO nb FROM element_historique WHERE date_visionnage IS NULL;
    ASSERT nb = 0, 'ECHEC 8 - date de visionnage vide';
    RAISE NOTICE 'OK 8 - date de visionnage automatique';

    -- 9. Une vidéo encore utilisée ne peut pas être supprimée
    BEGIN
        DELETE FROM video_youtube WHERE id_youtube = 'kJQP7kiw5Fk';
        RAISE EXCEPTION 'ECHEC 9 - vidéo utilisée supprimée';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'OK 9 - vidéo encore utilisée protégée';
    END;

    -- 10. Supprimer un salon efface sa playlist et son historique
    DELETE FROM salon WHERE id_salle = 'salon-test-A';
    SELECT (SELECT count(*) FROM element_playlist   WHERE id_salle = 'salon-test-A')
         + (SELECT count(*) FROM element_historique WHERE id_salle = 'salon-test-A') INTO nb;
    ASSERT nb = 0, 'ECHEC 10 - suppression en cascade incomplète';
    RAISE NOTICE 'OK 10 - suppression du salon en cascade';

    RAISE NOTICE '>>> TOUS LES TESTS F04/F05 PASSENT <<<';
END $$;

ROLLBACK;
