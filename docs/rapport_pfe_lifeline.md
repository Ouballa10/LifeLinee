# Rapport de Projet de Fin d'Etudes

## LifeLine - Application Web Medicale d'Urgence

### Realise par

Abdelmounaim Ouballa

### Encadre par

................................................

### Annee universitaire

2025-2026

---

## Remerciements

Avant de presenter ce travail, je tiens a exprimer mes sinceres remerciements a toutes les personnes qui ont contribue, de pres ou de loin, a la realisation de ce projet de fin d'etudes.

Je remercie tout d'abord mon encadrant pour son accompagnement, ses conseils, sa disponibilite et ses remarques constructives qui m'ont aide a ameliorer la qualite de ce projet.

Je remercie egalement l'ensemble des enseignants et responsables de ma formation pour les connaissances techniques et methodologiques acquises durant mon parcours.

Mes remerciements vont aussi a ma famille et a mes proches pour leur soutien moral, leurs encouragements et leur patience tout au long de cette periode.

Enfin, je remercie toutes les personnes qui ont teste l'application LifeLine et qui ont donne des retours utiles pour ameliorer l'experience utilisateur et la fiabilite du systeme.

---

## Resume

LifeLine est une application web medicale d'urgence, concue selon une approche mobile-first. Son objectif principal est de permettre a un utilisateur d'enregistrer ses informations medicales essentielles, de generer un QR code personnel et de rendre ces informations accessibles rapidement en cas d'urgence.

L'application permet la creation d'un compte, l'authentification via Firebase, la gestion d'un profil personnel et medical, la generation d'un QR code stable, le scan d'un QR code depuis la camera ou une image, ainsi que l'affichage d'une fiche medicale publique limitee aux informations utiles pour les secouristes.

Le projet repose sur une architecture moderne composee d'un frontend React avec Vite, d'une API backend Express.js, d'une base de donnees Supabase/PostgreSQL et d'un systeme d'authentification Firebase. Il integre aussi des principes de securite comme la separation des donnees privees et publiques, l'utilisation de tokens QR uniques et les politiques Row Level Security de Supabase.

Mots-cles : urgence medicale, QR code, React, Vite, Express.js, Firebase, Supabase, PostgreSQL, PWA.

---

## Abstract

LifeLine is a mobile-first emergency medical web application. Its main purpose is to allow users to store essential medical information, generate a personal QR code, and make selected emergency data quickly accessible when needed.

The application includes account creation, Firebase authentication, profile management, QR code generation, QR scanning through a camera or image upload, and a public emergency page that displays only safe and necessary medical information.

The project uses a modern architecture based on a React and Vite frontend, an Express.js backend API, Supabase/PostgreSQL for persistent storage, and Firebase Authentication. Security is considered through private/public data separation, unique QR tokens, and Supabase Row Level Security policies.

Keywords: medical emergency, QR code, React, Vite, Express.js, Firebase, Supabase, PostgreSQL, PWA.

---

## Introduction Generale

Dans les situations d'urgence medicale, chaque seconde compte. Les secouristes ou les medecins peuvent avoir besoin d'informations importantes comme le groupe sanguin, les allergies, les maladies chroniques, les traitements en cours ou le contact d'urgence d'une personne. Cependant, ces informations ne sont pas toujours disponibles au bon moment.

Le projet LifeLine repond a ce besoin en proposant une solution numerique simple, rapide et accessible depuis un smartphone. L'utilisateur renseigne ses donnees medicales essentielles et obtient un QR code personnel. En cas d'urgence, ce QR code peut etre scanne pour afficher une fiche medicale publique contenant uniquement les informations necessaires.

Ce rapport presente le contexte du projet, les objectifs, l'analyse fonctionnelle, les choix technologiques, la conception, la realisation, la securite et les perspectives d'amelioration.

---

## Chapitre 1 : Contexte et Problematique

### 1.1 Contexte

La digitalisation du domaine de la sante permet aujourd'hui de faciliter l'acces aux informations medicales, d'ameliorer la communication entre patients et professionnels de sante, et de reduire les pertes de temps lors des interventions urgentes.

Avec l'utilisation massive des smartphones, une application web mobile-first constitue une solution pratique, accessible et facile a deployer sans imposer une installation obligatoire.

### 1.2 Problematique

Lors d'une urgence, une personne peut etre inconsciente ou incapable de communiquer ses informations medicales. Les intervenants peuvent donc manquer de donnees critiques pour agir correctement.

La question principale est la suivante :

Comment permettre un acces rapide, simple et securise aux informations medicales essentielles d'une personne en cas d'urgence ?

### 1.3 Objectifs du Projet

Les objectifs de LifeLine sont :

- Permettre a l'utilisateur de creer un compte personnel.
- Authentifier l'utilisateur de maniere securisee.
- Enregistrer les informations personnelles et medicales importantes.
- Generer un QR code unique associe au profil medical.
- Permettre le scan du QR code depuis une camera ou une image.
- Afficher une fiche d'urgence publique et lisible rapidement.
- Proteger les donnees privees et exposer uniquement les informations necessaires.
- Proposer une interface mobile-first simple et ergonomique.

---

## Chapitre 2 : Cahier des Charges

### 2.1 Acteurs du Systeme

Utilisateur :

- Cree un compte.
- Se connecte.
- Complete son profil personnel et medical.
- Genere et partage son QR code.
- Consulte son tableau de bord.

Secouriste ou personne externe :

- Scanne un QR code LifeLine.
- Consulte la fiche medicale publique.
- Appelle le contact d'urgence.
- Peut imprimer la fiche si necessaire.

Administrateur technique :

- Configure les variables d'environnement.
- Gere le deploiement.
- Configure Firebase et Supabase.

### 2.2 Besoins Fonctionnels

Authentification :

- Inscription avec email et mot de passe via Firebase.
- Connexion avec email et mot de passe.
- Connexion avec Google.
- Synchronisation du compte Firebase avec le backend.

Gestion du profil :

- Consultation du profil.
- Modification des donnees personnelles : nom, email, telephone, ville.
- Modification des donnees medicales : allergies, maladies chroniques, medicaments, medecin referent, consignes critiques et contact d'urgence.

QR code :

- Generation d'un QR code stable et unique.
- Telechargement du QR code sous forme d'image.
- Partage du lien d'urgence.
- Ouverture de la fiche publique via `/emergency/:token`.

Scanner :

- Scan en direct avec la camera.
- Import d'une image QR.
- Detection et redirection automatique vers la fiche d'urgence.
- Fonctionnement possible meme sans compte pour le scanner public.

Fiche d'urgence :

- Affichage du nom, groupe sanguin, allergies, maladies, medicaments, consignes critiques et contact d'urgence.
- Bouton d'appel du contact d'urgence.
- Impression de la fiche.

### 2.3 Besoins Non Fonctionnels

- Interface responsive et mobile-first.
- Securite des donnees medicales.
- Rapidite d'acces a la fiche d'urgence.
- Architecture maintenable.
- Separation entre frontend, backend et base de donnees.
- Compatibilite avec un deploiement Vercel.
- Possibilite d'evolution vers une PWA plus complete.

---

## Chapitre 3 : Technologies Utilisees

### 3.1 Frontend

React.js :

React est utilise pour construire l'interface utilisateur sous forme de composants reutilisables. Il facilite la gestion des pages, des etats et de l'interaction avec l'utilisateur.

Vite :

Vite est utilise comme outil de build et serveur de developpement. Il permet un demarrage rapide du projet et une compilation optimisee pour la production.

React Router DOM :

Cette bibliotheque gere la navigation entre les pages : splash, login, register, home, dashboard, profile, edit-profile, profile medical, QR, scanner et emergency.

CSS :

Le projet utilise des fichiers CSS organises par domaine : `main.css`, `auth.css`, `profile.css`, `emergency.css`, `app-redesign.css` et `variables.css`.

PWA :

Le projet contient un manifest, un service worker, une page offline et des icones. Cela prepare l'application a un comportement proche d'une application mobile.

### 3.2 Backend

Node.js :

Node.js est l'environnement d'execution JavaScript cote serveur.

Express.js :

Express est utilise pour creer l'API REST. Il gere les routes d'authentification, d'utilisateur, d'urgence et de QR code.

CORS :

Le module `cors` permet au frontend de communiquer avec l'API backend.

dotenv :

`dotenv` permet de charger les variables d'environnement depuis des fichiers `.env`.

Nodemon :

Nodemon est utilise en developpement pour redemarrer automatiquement le serveur apres modification du code.

### 3.3 Base de Donnees

Supabase :

Supabase est utilise comme plateforme backend basee sur PostgreSQL. Il fournit une base de donnees relationnelle, des policies de securite et des cles d'acces.

PostgreSQL :

PostgreSQL stocke les profils utilisateurs, les profils medicaux et les logs d'acces d'urgence.

Extensions PostgreSQL :

- `pgcrypto` pour la generation d'identifiants UUID.
- `citext` pour gerer les emails sans sensibilite a la casse.

Row Level Security :

Les tables `user_profiles`, `medical_profiles` et `emergency_logs` activent RLS afin de limiter les actions selon l'utilisateur authentifie.

### 3.4 Authentification

Firebase Authentication :

Firebase Auth est utilise pour gerer l'inscription, la connexion, la connexion Google et les tokens d'identite.

Firebase ID Token :

Le backend verifie le token Firebase envoye par le frontend avant d'autoriser l'acces aux donnees privees.

### 3.5 QR Code

Bibliotheque `qrcode` :

Elle permet de generer une image QR code a partir du lien public d'urgence.

Bibliotheque `qr-scanner` :

Elle permet de lire un QR code depuis la camera ou depuis une image importee.

### 3.6 Deploiement

Vercel :

Le projet contient une configuration `vercel.json` et un dossier `api` permettant d'executer l'API sur Vercel.

Variables d'environnement :

Les cles sensibles comme `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`, `FIREBASE_API_KEY` et `FRONTEND_URL` sont configurees via `.env` ou via l'interface de deploiement.

---

## Chapitre 4 : Architecture du Projet

### 4.1 Architecture Generale

Le projet est organise en plusieurs parties :

- `frontend` : application React/Vite.
- `backend` : API Express.js.
- `api` : point d'entree compatible avec Vercel.
- `supabase` : schema SQL de la base de donnees.
- `docs` : documents, diagrammes UML, captures et rapport.

### 4.2 Architecture Frontend

Le frontend contient :

- `pages` : pages principales de l'application.
- `components` : composants reutilisables.
- `routes` : configuration des routes.
- `context` : gestion globale de l'etat.
- `hooks` : hooks personnalises.
- `services` : communication avec API, Firebase, Supabase et QR.
- `styles` : fichiers CSS.
- `pwa` : service worker et enregistrement PWA.

Pages principales :

- `Splash.jsx` : ecran d'accueil.
- `Login.jsx` : connexion.
- `Register.jsx` : inscription.
- `Home.jsx` : page principale.
- `Dashboard.jsx` : tableau de bord.
- `Profile.jsx` : consultation du profil.
- `EditProfile.jsx` : modification des donnees personnelles.
- `MedicalForm.jsx` : modification des donnees medicales.
- `QRCodePage.jsx` : generation, affichage, telechargement et partage du QR.
- `Scanner.jsx` : lecture de QR code.
- `Emergency.jsx` : fiche publique d'urgence.

### 4.3 Architecture Backend

Le backend suit une organisation claire :

- `controllers` : logique des endpoints.
- `routes` : definition des routes.
- `models` : acces aux donnees Supabase.
- `services` : logique metier.
- `middlewares` : authentification, verification base de donnees, gestion d'erreurs.
- `config` : configuration de l'environnement et Supabase.
- `utils` : validateurs, helpers et generation de tokens.

Routes principales :

- `/api/auth` : synchronisation Firebase, inscription et connexion.
- `/api/users` : lecture et mise a jour du profil utilisateur.
- `/api/qr` : generation de payload QR.
- `/api/emergency` : lecture de fiche publique et logs d'acces.

---

## Chapitre 5 : Conception de la Base de Donnees

### 5.1 Table `user_profiles`

Cette table stocke les informations personnelles de l'utilisateur :

- `id`
- `firebase_uid`
- `auth_user_id`
- `full_name`
- `email`
- `phone`
- `city`
- `created_at`
- `updated_at`

Elle impose une contrainte pour garantir qu'un profil possede au moins une information d'identification : Firebase UID, Supabase auth user id ou email.

### 5.2 Table `medical_profiles`

Cette table stocke les informations medicales :

- `id`
- `user_profile_id`
- `blood_type`
- `allergies`
- `chronic_diseases`
- `medications`
- `emergency_contact_name`
- `emergency_contact_phone`
- `emergency_contact_relationship`
- `doctor_name`
- `critical_instructions`
- `qr_token`
- `created_at`
- `updated_at`

Le champ `qr_token` est unique et stable. Il permet d'ouvrir la fiche d'urgence publique sans exposer l'identifiant interne de l'utilisateur.

### 5.3 Table `emergency_logs`

Cette table permet d'enregistrer les acces aux fiches d'urgence :

- `id`
- `qr_token`
- `responder`
- `location`
- `opened_at`
- `created_at`
- `updated_at`

### 5.4 Vue `public_emergency_profiles`

Cette vue expose uniquement les donnees necessaires pour une urgence :

- nom complet
- groupe sanguin
- allergies
- maladies chroniques
- medicaments
- contact d'urgence
- consignes critiques
- token QR

Cette separation permet de limiter l'exposition des donnees privees.

---

## Chapitre 6 : Realisation

### 6.1 Authentification

L'utilisateur s'inscrit ou se connecte avec Firebase Authentication. Apres authentification, le frontend envoie le Firebase ID Token au backend. Le backend verifie ce token, synchronise le compte avec Supabase, puis cree ou recupere le profil medical associe.

### 6.2 Tableau de Bord

Le tableau de bord affiche un resume du dossier medical. Il calcule un pourcentage de completude selon les informations renseignees : nom, groupe sanguin, allergies, maladies, medicaments, contact d'urgence et consignes critiques.

Il donne aussi acces aux pages de modification du profil, du profil medical et a la fiche complete.

### 6.3 Gestion du Profil Medical

L'utilisateur peut renseigner :

- allergies
- maladies chroniques
- medicaments
- contact d'urgence
- medecin referent
- consignes d'urgence

Les donnees sont envoyees au backend, normalisees puis enregistrees dans Supabase.

### 6.4 Generation du QR Code

Chaque profil medical possede un `qr_token` unique. A partir de ce token, l'application construit une URL publique du type :

`/emergency/:token`

Cette URL est ensuite transformee en image QR code. L'utilisateur peut telecharger le QR ou le partager.

### 6.5 Scanner QR

La page scanner utilise la camera du telephone ou l'import d'une image. Apres lecture du QR, l'application analyse le contenu et redirige automatiquement vers la fiche d'urgence si le QR contient un token LifeLine valide.

### 6.6 Fiche d'Urgence

La fiche publique affiche uniquement les informations utiles :

- nom
- groupe sanguin
- allergies
- maladies chroniques
- medicaments
- consignes critiques
- contact d'urgence

Elle contient aussi un bouton pour appeler le contact d'urgence et une option d'impression.

---

## Chapitre 7 : Securite

### 7.1 Protection de l'Authentification

L'authentification est confiee a Firebase Auth. Le backend ne fait pas confiance directement au frontend : il verifie le Firebase ID Token avant toute operation privee.

### 7.2 Protection des Donnees

Les donnees privees sont accessibles uniquement a l'utilisateur authentifie. Les donnees publiques sont limitees a la fiche d'urgence.

### 7.3 Supabase Service Role

La cle `SUPABASE_SERVICE_ROLE_KEY` est utilisee uniquement cote backend. Elle ne doit jamais etre placee dans le frontend.

### 7.4 Row Level Security

Supabase active RLS sur les tables importantes. Les policies autorisent l'utilisateur authentifie a lire, inserer et modifier uniquement ses propres profils.

### 7.5 Token QR

Le QR code n'utilise pas l'identifiant interne de l'utilisateur. Il utilise un token aleatoire unique, ce qui reduit le risque d'exposition directe des identifiants de base de donnees.

---

## Chapitre 8 : Tests et Validation

Les tests fonctionnels a realiser sont :

- Creation d'un compte avec email et mot de passe.
- Connexion avec Firebase.
- Connexion Google.
- Modification du profil personnel.
- Modification du profil medical.
- Generation du QR code.
- Telechargement du QR code.
- Scan du QR code via camera.
- Scan depuis une image.
- Ouverture de la fiche d'urgence publique.
- Verification du bouton d'appel.
- Verification de l'impression.
- Test de l'application sur mobile.
- Test d'acces sans authentification a la fiche publique.
- Test de protection des pages privees.

---

## Chapitre 9 : Difficultes Rencontrees

Parmi les difficultes possibles du projet :

- Synchroniser Firebase Auth avec une base Supabase/PostgreSQL.
- Garantir que le QR code reste stable pour chaque profil.
- Separer correctement les informations privees et publiques.
- Gerer l'acces camera dans le navigateur.
- Adapter l'interface a une experience mobile-first.
- Preparer le projet pour un deploiement sur Vercel.
- Configurer les variables d'environnement sans exposer les cles sensibles.

---

## Chapitre 10 : Perspectives d'Amelioration

Le projet peut etre ameliore par :

- Ajout d'un espace administrateur.
- Historique complet des scans d'urgence.
- Geolocalisation optionnelle lors de l'ouverture d'une fiche.
- Notifications aux contacts d'urgence.
- Export PDF de la fiche medicale.
- Mode multilingue : francais, arabe, anglais.
- Application mobile native avec React Native.
- Ajout d'une validation plus avancee des donnees medicales.
- Ajout de tests automatises frontend et backend.
- Ajout d'un systeme de consentement et de confidentialite plus detaille.

---

## Conclusion Generale

LifeLine est une solution web moderne qui repond a un besoin reel : rendre les informations medicales essentielles disponibles rapidement en cas d'urgence. Grace a l'utilisation d'un QR code unique, l'application facilite l'acces a une fiche medicale publique sans obliger le secouriste a posseder un compte.

Le projet combine plusieurs technologies actuelles : React, Vite, Express.js, Firebase Auth, Supabase et PostgreSQL. Cette architecture assure une separation claire entre l'interface utilisateur, la logique serveur, l'authentification et la persistance des donnees.

Ce travail a permis de mettre en pratique des competences en developpement frontend, backend, base de donnees, securite, conception d'API et experience utilisateur mobile. LifeLine constitue ainsi une base solide pour une future application medicale plus complete, deployable et utilisable dans des situations reelles.

---

## Bibliographie et Webographie

- Documentation React : https://react.dev/
- Documentation Vite : https://vitejs.dev/
- Documentation React Router : https://reactrouter.com/
- Documentation Express.js : https://expressjs.com/
- Documentation Firebase Authentication : https://firebase.google.com/docs/auth
- Documentation Supabase : https://supabase.com/docs
- Documentation PostgreSQL : https://www.postgresql.org/docs/
- Documentation Vercel : https://vercel.com/docs
- Documentation qrcode npm : https://www.npmjs.com/package/qrcode
- Documentation qr-scanner npm : https://www.npmjs.com/package/qr-scanner

