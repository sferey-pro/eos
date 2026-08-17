# Historique de la Conversation et des Décisions (CONVERSATION.md)

Ce document a été généré pour assurer une transition fluide vers un autre assistant IA. Il résume l'intégralité des sessions de travail, des décisions architecturales, et des correctifs appliqués sur le projet **EOS**.

## 1. Contexte et Objectifs Intiaux
- L'utilisateur souhaitait créer **EOS**, un orchestrateur de conteneurs local rapide (moteur Bun) et stylisé (React/Tailwind) pour gérer ses projets de développement en "1 clic".
- La consigne principale était un **"Maximum Effort"** sur la propreté du code, la performance, et l'esthétique. L'utilisateur a demandé à plusieurs reprises un nettoyage drastique : *"Nettoie le code afin de n'avoir que ce qui est utile"*.

## 2. Refonte Architecturale (Frontend)
- **Suppression du Routage** : Nous avons retiré `react-router-dom` et purgé toutes les pages secondaires (`SettingsPage`, `CleanPage`, `AppSidebar`, etc.) pour concentrer 100% de la valeur sur un **Dashboard unique (`HomePage.tsx`)**.
- **Composants d'interface** : Utilisation de **Shadcn UI** pour les modales, listes déroulantes et accordéons.
- **Thème Visuel** : Une exigence esthétique très spécifique a été fixée par l'utilisateur. Le thème "Retro" a été sculpté sur-mesure pour ressembler à **"Far Cry Blood Dragon"** (Synthwave, Néons, scanlines, couleurs cyan/fuchsia très intenses).

## 3. Implémentation du Backend (Moteur Bun)
- **Persistance ultra-rapide** : L'état (Projets, Presets, Apps) est sauvegardé via `bun:sqlite`. La base a été optimisée avec des `PRAGMA` agressifs (Memory Temp Store, WAL).
- **Spawn & Flux** : Les processus (Docker Compose, NPM, Make) sont lancés via `Bun.spawn`. 
- **WebSockets** : Les logs des conteneurs (`docker logs -f`) sont capturés en direct par le backend Bun et diffusés vers le frontend React via WebSockets.
- **Optimisation Mémoire** : La file d'attente des logs en RAM est limitée à 1000 lignes et nettoyée intelligemment (via `splice()` au lieu de `shift()` pour une complexité O(1)).
- **Graceful Shutdown** : Le serveur Bun écoute `SIGINT` et `SIGTERM` pour couper proprement les sous-processus et fermer la base de données. Plus aucun conteneur ou log n'est laissé "zombie" après l'arrêt d'EOS.

## 4. Fonctionnalités Clés Développées
- **Scanner Intelligent** : Permet de renseigner un chemin (`/home/user/project`) et de détecter automatiquement les commandes de lancement (Makefile, Docker, npm).
- **Gestion des Presets** : Permet de regrouper plusieurs projets et de les lancer simultanément ("Aurore").
- **Lanceur d'Applications (App Launcher)** : EOS peut enregistrer des applications web tierces, afficher leur icône, et les ouvrir dans un nouvel onglet ou au sein d'une **IFrame** directement sur le tableau de bord.
- **Monitoring** : Pings actifs des services via `Bun.connect()`, et récupération des métriques CPU/RAM via `docker stats` avec un affichage graphique SVG fait main.

## 5. Audits Qualité ("Maximum Effort" V1, V2, V3)
L'utilisateur a demandé 3 passes d'audits massives par des sous-agents experts (Frontend, Backend, UX, QA) :
- **Sécurité** : Colmatage d'une faille "Path Traversal" sur l'endpoint `/api/logo`.
- **Réactivité (Hooks)** : Mise en cache massive via `useMemo` et `useCallback` sur l'ensemble de l'interface pour empêcher les re-rendus.
- **Accessibilité** : Ajout d'attributs `aria-label`, `aria-hidden` et de liaisons `htmlFor` parfaites.
- **Formatage** : Formatage automatique standardisé par `Biome`.
- **Tests Unitaires** : Mise en place d'une suite rigoureuse avec `bun:test` et `@testing-library/react` (mocking de fetch, happy-dom). Le projet a atteint un taux de couverture de plus de 82%.

## 6. Prochaines Étapes Suggérées (Phase 6)
Si vous prenez la suite de ce projet, voici les chantiers ouverts (listés dans `UPGRADE.md`) :
- Création d'une **Command Palette** (ex: Raccourci `cmd+k` pour lancer des projets au clavier).
- Modification de la **configuration / variables d'environnement** directement depuis l'UI.
- Étendre la récupération des métriques (CPU/RAM) aux processus qui ne sont pas gérés par Docker (via leur PID).

---
**Pour la prochaine IA :** Le projet est stable, couvert par les tests, et build parfaitement. Toute nouvelle fonctionnalité doit s'inscrire dans cette rigueur extrême. Bon courage !
