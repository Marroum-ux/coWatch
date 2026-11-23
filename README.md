# coWatch

Plateforme web permettant à plusieurs utilisateurs de regarder des vidéos ensemble en temps réel, de discuter via un chat et de gérer une playlist collaborative.

## Projet IL

Projet réalisé en groupe dans le cadre du projet IL.
## Base de données (PostgreSQL)

### Prérequis
- PostgreSQL installé (port par défaut : 5432)
- pgAdmin (optionnel, pour voir les tables)

### 1. Créer la base
Dans pgAdmin : clic droit sur **Databases** > **Create** > **Database...**
Nom : `cowatch`

### 2. Créer les tables
Dans pgAdmin : sélectionner la base `cowatch` > **Tools** > **Query Tool**
Ouvrir le fichier `backend/config/schema.sql` puis exécuter (F5).

8 tables sont créées : `salon`, `participant_salon`, `video_youtube`, `playlist`, `element_playlist`, `historique`, `element_historique`, `etat_lecture`.

### 3. Configurer le fichier `.env`
Dans le dossier `backend`, copier `.env.example` et le renommer en `.env`.
Remplir avec ses propres informations :

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cowatch
DB_USER=postgres
DB_PASSWORD=votre_mot_de_passe
```

⚠️ Le fichier `.env` ne doit jamais être envoyé sur GitHub (il est dans `.gitignore`).

### 4. Lancer le projet
Backend :
```
cd backend
npm install
npm run dev
```
Le terminal doit afficher : `Connexion à PostgreSQL réussie !`

Frontend (dans un autre terminal) :
```
cd frontend
npm install
npm run dev
```
Ouvrir http://localhost:5173