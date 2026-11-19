-- ==========================================
-- BASE DE DONNEES coWatch
-- ==========================================

-- 1. SALON
CREATE TABLE salon (
    id_salle VARCHAR(36) PRIMARY KEY,
    code_invitation VARCHAR(50) UNIQUE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. PARTICIPANT_SALON
-- Le role createur est propre à chaque salon.
CREATE TABLE participant_salon (
    id_salle VARCHAR(36) NOT NULL,
    id_participant VARCHAR(100) NOT NULL,
    pseudonyme VARCHAR(50) NOT NULL,
    est_createur BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (id_salle, id_participant),

    FOREIGN KEY (id_salle)
        REFERENCES salon(id_salle)
        ON DELETE CASCADE
);

-- Un seul createur par salon
CREATE UNIQUE INDEX un_seul_createur_par_salon
ON participant_salon(id_salle)
WHERE est_createur = TRUE;

-- 3. VIDEO_YOUTUBE
CREATE TABLE video_youtube (
    id_youtube VARCHAR(30) PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    duree INTEGER
);

-- 4. PLAYLIST
-- Une playlist par salon
CREATE TABLE playlist (
    id_salle VARCHAR(36) PRIMARY KEY,

    FOREIGN KEY (id_salle)
        REFERENCES salon(id_salle)
        ON DELETE CASCADE
);

-- 5. ELEMENT_PLAYLIST
CREATE TABLE element_playlist (
    id_element SERIAL PRIMARY KEY,
    id_salle VARCHAR(36) NOT NULL,
    id_youtube VARCHAR(30) NOT NULL,
    position INTEGER NOT NULL,
    date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_salle)
        REFERENCES playlist(id_salle)
        ON DELETE CASCADE,

    FOREIGN KEY (id_youtube)
        REFERENCES video_youtube(id_youtube),

    UNIQUE (id_salle, position)
);

-- 6. HISTORIQUE
-- Un historique par salon
CREATE TABLE historique (
    id_salle VARCHAR(36) PRIMARY KEY,

    FOREIGN KEY (id_salle)
        REFERENCES salon(id_salle)
        ON DELETE CASCADE
);

-- 7. ELEMENT_HISTORIQUE
CREATE TABLE element_historique (
    id_element SERIAL PRIMARY KEY,
    id_salle VARCHAR(36) NOT NULL,
    id_youtube VARCHAR(30) NOT NULL,
    date_visionnage TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_salle)
        REFERENCES historique(id_salle)
        ON DELETE CASCADE,

    FOREIGN KEY (id_youtube)
        REFERENCES video_youtube(id_youtube)
);

-- 8. ETAT_LECTURE
CREATE TABLE etat_lecture (
    id_salle VARCHAR(36) PRIMARY KEY,
    id_youtube VARCHAR(30),
    position INTEGER DEFAULT 0,
    statut VARCHAR(20) DEFAULT 'paused',
    date_mise_a_jour TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_salle)
        REFERENCES salon(id_salle)
        ON DELETE CASCADE,

    FOREIGN KEY (id_youtube)
        REFERENCES video_youtube(id_youtube),

    CHECK (position >= 0),
    CHECK (statut IN ('playing', 'paused'))
);