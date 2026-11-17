-- ============================================================
-- coWatch – Schéma PostgreSQL commun (PostgreSQL 13+)
-- Fichier : backend/db/schema.sql
-- Chaque table indique le membre responsable de son code d'accès.
-- ============================================================

-- gen_random_uuid() est natif depuis PostgreSQL 13.

-- ------------------------------------------------------------
-- Membre 1 – F01 Salons et identité
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS salon (
    id             VARCHAR(10)  PRIMARY KEY,            -- identifiant court aléatoire, ex. "k3T9xQ2pLm"
    date_creation  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
-- Le lien d'invitation n'est pas stocké : il se calcule
--   `${FRONTEND_URL}/salon/${salon.id}`
-- Le créateur est la ligne de participant_salon où est_createur = TRUE.

CREATE TABLE IF NOT EXISTS participant_salon (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),  -- identifiant temporaire
    salon_id       VARCHAR(10)  NOT NULL REFERENCES salon(id) ON DELETE CASCADE,
    pseudonyme     VARCHAR(30)  NOT NULL,
    est_createur   BOOLEAN      NOT NULL DEFAULT FALSE,
    jeton_hash     CHAR(64)     NOT NULL UNIQUE,        -- SHA-256 du jeton secret (jamais le jeton en clair)
    date_arrivee   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT pseudonyme_non_vide CHECK (length(btrim(pseudonyme)) > 0)
);

-- Un seul créateur par salon
CREATE UNIQUE INDEX IF NOT EXISTS un_createur_par_salon
    ON participant_salon (salon_id) WHERE est_createur;

CREATE INDEX IF NOT EXISTS idx_participant_salon
    ON participant_salon (salon_id);

-- ------------------------------------------------------------
-- Membre 4 – F04 Playlist et F05 Historique
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS video (
    id          SERIAL        PRIMARY KEY,
    youtube_id  VARCHAR(11)   NOT NULL UNIQUE,          -- ex. "dQw4w9WgXcQ"
    titre       VARCHAR(200),                           -- facultatif (oEmbed YouTube)
    CONSTRAINT youtube_id_format CHECK (youtube_id ~ '^[A-Za-z0-9_-]{11}$')
);

CREATE TABLE IF NOT EXISTS playlist_video (
    salon_id    VARCHAR(10)   NOT NULL REFERENCES salon(id) ON DELETE CASCADE,
    video_id    INTEGER       NOT NULL REFERENCES video(id),
    position    INTEGER       NOT NULL,                 -- ordre d'affichage, 1, 2, 3...
    date_ajout  TIMESTAMPTZ   NOT NULL DEFAULT now(),
    PRIMARY KEY (salon_id, video_id)                    -- une vidéo au plus une fois par playlist
);

CREATE INDEX IF NOT EXISTS idx_playlist_ordre
    ON playlist_video (salon_id, position);

CREATE TABLE IF NOT EXISTS historique_video (
    id               SERIAL        PRIMARY KEY,
    salon_id         VARCHAR(10)   NOT NULL REFERENCES salon(id) ON DELETE CASCADE,
    video_id         INTEGER       NOT NULL REFERENCES video(id),
    date_visionnage  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_historique_salon
    ON historique_video (salon_id, date_visionnage DESC);

-- Pas de table pour les messages du chat : leur persistance
-- n'est pas exigée (rapport de conception, §4).
-- L'état de lecture vidéo est gardé en mémoire côté serveur (membre 2).
