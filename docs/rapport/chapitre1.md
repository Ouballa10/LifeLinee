# Chapitre 1 : Présentation générale du projet

## 1. Introduction

Ce premier chapitre a pour objectif de présenter le cadre général dans lequel s'inscrit notre projet de fin d'études. Nous commencerons par exposer la problématique identifiée dans le domaine des urgences médicales, avant de présenter la solution proposée pour y répondre. Nous décrirons ensuite l'équipe ayant contribué à la réalisation du projet, ainsi que la méthodologie de travail adoptée et les outils de gestion utilisés durant le cycle de développement.

## 2. Problématique

Les situations d'urgence médicale représentent un enjeu majeur dans le domaine de la santé. Lorsqu'un accident, un malaise cardiaque, une crise d'épilepsie ou toute autre urgence survient, les premières minutes d'intervention sont souvent décisives pour la survie du patient.

Dans ce type de situation, les secouristes et les professionnels de santé ont besoin d'accéder rapidement à plusieurs informations médicales essentielles, notamment :

- le groupe sanguin du patient ;
- ses allergies médicamenteuses ;
- ses maladies chroniques ;
- ses traitements en cours ;
- les coordonnées d'un contact d'urgence ou d'un médecin référent.

Cependant, dans la majorité des cas, ces informations restent indisponibles au moment de l'intervention. Le patient peut être inconscient, en état de choc ou incapable de communiquer correctement. De plus, les documents physiques tels que les carnets médicaux ou les ordonnances ne sont généralement pas accessibles immédiatement.

Cette situation peut entraîner plusieurs conséquences graves :

- un retard dans la prise en charge médicale ;
- des risques d'erreurs thérapeutiques ;
- une difficulté à contacter rapidement les proches du patient ;
- une perte de temps critique pouvant aggraver l'état de la victime.

Au Maroc, cette problématique est encore plus importante en raison de la faible numérisation des dossiers médicaux individuels. Les citoyens ne disposent actuellement d'aucune solution simple et accessible leur permettant de rendre leurs informations médicales disponibles en cas d'urgence.

La problématique principale de notre projet peut donc être formulée comme suit :

> « Comment permettre un accès rapide, universel et sécurisé aux informations médicales d'urgence d'un individu, sans dépendre de sa capacité à communiquer ni de la disponibilité de documents physiques ? »

## 3. Solution proposée

Afin de répondre à la problématique identifiée, nous avons conçu et développé une application nommée **LifeLine**. Il s'agit d'une Progressive Web App (PWA) mobile-first dédiée à la gestion des informations médicales d'urgence à travers l'utilisation d'un QR Code personnel.

Le principe de fonctionnement de l'application repose sur plusieurs étapes :

### • Création du dossier médical

L'utilisateur crée un compte sécurisé puis renseigne ses informations médicales essentielles telles que :

- le groupe sanguin ;
- les allergies ;
- les maladies chroniques ;
- les traitements médicaux ;
- les contacts d'urgence ;
- le médecin référent ;
- les consignes médicales importantes.

### • Génération du QR Code

Une fois les informations enregistrées, l'application génère automatiquement un QR Code unique associé au profil médical de l'utilisateur. Ce QR Code peut être imprimé, téléchargé ou affiché directement sur le téléphone.

### • Accès aux informations en situation d'urgence

En cas d'urgence, toute personne disposant d'un smartphone peut scanner le QR Code afin d'accéder instantanément à la fiche médicale du patient depuis un navigateur web, sans création de compte ni installation d'application.

### • Traçabilité des accès

L'application enregistre également l'historique des consultations de la fiche médicale (date et heure), permettant à l'utilisateur de suivre les accès effectués à ses informations.

### Tableau comparatif avec les solutions existantes

Afin de mieux situer notre solution par rapport aux solutions existantes, nous présentons le tableau comparatif suivant :

| Caractéristique | LifeLine | ICE (In Case of Emergency) | Apple Health / Samsung Health | Bracelet MedicAlert |
|----------------|----------|---------------------------|-------------------------------|---------------------|
| Accès sans compte pour le secouriste | ✅ | ❌ | ❌ (téléphone verrouillé) | ✅ (gravure limitée) |
| Fonctionne hors connexion | ✅ | ❌ | ✅ | ✅ |
| Aucune installation requise pour le lecteur | ✅ | ❌ | ❌ | ✅ |
| Informations médicales détaillées | ✅ | ❌ (nom + numéro seulement) | Partiel | ❌ (très limité) |
| Traçabilité des accès | ✅ | ❌ | ❌ | ❌ |
| Multilingue (FR, AR, EN) | ✅ | ❌ | ❌ | ❌ |
| Gratuit | ✅ | ✅ | ✅ | ❌ (abonnement) |
| Adapté au contexte marocain | ✅ | ❌ | ❌ | ❌ |

## 4. Équipe du projet

La réalisation de ce projet a été assurée par l'équipe suivante :

| Rôle | Nom |
|------|-----|
| Développeur Full-Stack | [Votre nom complet] |
| Encadrant académique | [Nom de l'encadrant] |

Le projet a été réalisé de manière autonome, couvrant l'ensemble des phases : analyse des besoins, conception, développement frontend et backend, tests et déploiement en production.

## 5. Méthodologie de travail

Pour la conduite de ce projet, nous avons adopté la méthodologie **Agile Scrum**. Ce choix se justifie par la nature itérative du développement et la nécessité d'adapter continuellement les fonctionnalités aux besoins identifiés au fil de l'avancement.

### 5.1. Principes de Scrum

Scrum est un cadre de travail agile qui organise le développement en cycles courts appelés **sprints** (généralement de 1 à 2 semaines). Chaque sprint aboutit à un incrément fonctionnel du produit, testé et potentiellement livrable. Les principes fondamentaux de Scrum sont les suivants :

- **Itérativité** — Le produit est construit progressivement, sprint après sprint.
- **Adaptabilité** — Les priorités peuvent être réajustées à chaque fin de sprint en fonction des retours obtenus.
- **Livraison continue** — Chaque sprint produit une version fonctionnelle du logiciel.
- **Transparence** — L'avancement du projet est visible et mesurable à tout moment.

### 5.2. Organisation des sprints

Le développement de LifeLine a été structuré en six sprints :

| Sprint | Durée | Module développé |
|--------|-------|-----------------|
| Sprint 1 | 2 semaines | Authentification (Firebase Auth, email/mot de passe, Google OAuth) |
| Sprint 2 | 2 semaines | Profil médical (création, modification, consultation des données de santé) |
| Sprint 3 | 2 semaines | QR Code (génération, partage, téléchargement) |
| Sprint 4 | 1 semaine | Scanner QR (caméra, import d'image) et page d'urgence publique |
| Sprint 5 | 1 semaine | Documents médicaux (upload, stockage, suppression) |
| Sprint 6 | 2 semaines | Finitions (internationalisation, mode sombre, PWA offline, déploiement) |

### 5.3. Artefacts Scrum utilisés

- **Product Backlog** — Liste priorisée de l'ensemble des fonctionnalités à développer pour le projet.
- **Sprint Backlog** — Sous-ensemble du Product Backlog sélectionné pour être réalisé durant un sprint donné.
- **Incrément** — Version fonctionnelle et testée du produit, livrée à la fin de chaque sprint.

## 6. Outils de gestion du projet

Pour assurer le suivi et la bonne organisation du travail tout au long du développement, nous avons utilisé les outils suivants :

| Outil | Utilisation |
|-------|-------------|
| **Git / GitHub** | Gestion de versions du code source, suivi des modifications et historique du projet |
| **Trello** | Organisation des tâches en tableaux Kanban (À faire, En cours, Terminé), suivi de l'avancement des sprints |
| **VS Code** | Environnement de développement intégré (IDE) principal |
| **Vercel** | Déploiement continu automatique à chaque mise à jour du code |
| **Navigateur (DevTools)** | Tests fonctionnels, débogage et inspection des performances |

L'utilisation de Trello nous a permis de visualiser clairement l'état d'avancement de chaque fonctionnalité, de prioriser les tâches selon leur importance et de maintenir une traçabilité complète du travail réalisé à chaque sprint.

## 7. Conclusion

Ce premier chapitre nous a permis de poser les bases du projet LifeLine en identifiant clairement la problématique à résoudre, en présentant la solution proposée et en décrivant l'organisation méthodologique adoptée. La méthodologie Agile Scrum, combinée aux outils de gestion choisis, nous a offert un cadre structuré et flexible pour mener à bien le développement de l'application.

Le chapitre suivant sera consacré à l'étude fonctionnelle et à la conception détaillée du système à travers l'analyse des besoins et la modélisation UML et MERISE.
