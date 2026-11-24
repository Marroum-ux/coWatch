# Événements Socket.IO – coWatch

Ce document présente les événements Socket.IO prévus pour permettre aux utilisateurs d'un même salon de communiquer en temps réel.

## 1. Rejoindre un salon

- **Événement :** `salon:rejoindre`
- **Sens :** client → serveur
- **Rôle :** demander à rejoindre un salon.
- **Données prévues :** identifiant du salon et pseudonyme du participant.

## 2. Contrôler la vidéo

- **Événement :** `video:commande`
- **Sens :** client → serveur
- **Rôle :** transmettre une action sur la vidéo.
- **Données prévues :** type d'action (lecture, pause ou déplacement dans la vidéo) et position.

## 3. Synchroniser la vidéo

- **Événement :** `video:etat`
- **Sens :** serveur → clients du salon
- **Rôle :** transmettre l'état de lecture de la vidéo afin que les participants restent synchronisés.
- **Données prévues :** état de lecture et position actuelle.

## 4. Envoyer un message

- **Événement :** `chat:envoyer`
- **Sens :** client → serveur
- **Rôle :** envoyer un message aux participants du même salon.
- **Données prévues :** pseudonyme et contenu du message.

## 5. Mettre à jour la playlist

- **Événement :** `playlist:modifiee`
- **Sens :** serveur → clients du salon
- **Rôle :** informer les participants qu'une modification de la playlist a été effectuée.
- **Données prévues :** nouvelle liste de vidéos.

## Remarque

Ces événements sont définis pour organiser le travail entre les membres du groupe. Ils seront implémentés progressivement lors du développement des fonctionnalités correspondantes.