# Relier le formulaire du site au Google Agenda du client

À faire **avec le compte Google du client** (celui dont l'agenda doit recevoir les rendez-vous). Durée : 10 minutes.

## 1. Créer le script
1. Ouvrir https://script.google.com connecté au compte du client → **Nouveau projet**. Le renommer « Serrurier Vaucluse – rendez-vous ».
2. Remplacer tout le contenu de `Code.gs` par celui du fichier `Code.gs` de ce dossier.
3. Paramètres du projet (roue dentée) → cocher **Afficher le fichier manifeste « appsscript.json »**, puis remplacer son contenu par le fichier `appsscript.json` de ce dossier (fuseau horaire Europe/Paris).
4. Si les demandes doivent arriver sur une autre adresse que celle du compte, renseigner `NOTIFY_EMAIL` en haut de `Code.gs`.
5. Enregistrer.

## 2. Autoriser l'accès à l'agenda
1. En haut de l'éditeur, choisir la fonction **autoriser** → **Exécuter**.
2. Accepter les autorisations (agenda, envoi d'e-mails). Google affiche « Application non validée » : c'est normal pour un script personnel → **Paramètres avancés** → **Accéder à … (non sécurisé)** → **Autoriser**.

## 3. Publier
1. **Déployer** → **Nouveau déploiement** → type **Application Web**.
2. Exécuter en tant que : **Moi** · Qui a accès : **Tout le monde**.
3. **Déployer**, puis copier l'**URL de l'application Web** (elle se termine par `/exec`).

## 4. Brancher le site
Coller cette URL dans `AGENDA_URL` en haut de `_outils/generer.py`, lancer `python3 _outils/generer.py`, puis publier.

## Ce que fait le formulaire ensuite
- Les créneaux déjà occupés dans l'agenda (rendez-vous du site **ou** événements ajoutés à la main) apparaissent « complet ».
- Une demande crée un événement dans l'agenda et envoie un e-mail au serrurier ; le client reçoit une confirmation s'il a laissé son e-mail.
- Une demande urgente crée un événement « 🚨 URGENT » d'une heure à l'instant même et envoie un e-mail.

## Modifier le script plus tard
Après une modification du code : **Déployer** → **Gérer les déploiements** → crayon → Version : **Nouvelle version** → Déployer. L'URL ne change pas.
