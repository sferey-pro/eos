# Roadmap & Mises à Jour (UPGRADE.md)

Ce document suit l'évolution technique du projet, les étapes à venir, et la dette technique à résoudre.

## Phase 1 : Configuration et Architecture de base ✅
- [x] Initialisation React / Bun / Tailwind v4.
- [x] Configuration Qualité (Biome, Husky, Lint-staged).
- [x] Outils métiers (Zod, React Router).
- [x] Rédaction du CONTEXT.md, README.md, UPGRADE.md.

## Phase 2 : Modélisation et Scanner ✅
- **Modèle de données** : Créer les schémas Zod pour représenter un "Projet" (nom, chemin, commande, statut).
- **Stockage local** : Mettre en place la base de données **SQLite** (`bun:sqlite`) pour sauvegarder l'état des projets.
- **Scanner IA/Logique** : Développer l'utilitaire backend (`src/lib/scanner.ts`) capable de lire un dossier pour détecter les `package.json`, `docker-compose.yml`, etc.

## Phase 3 : Interface Utilisateur (UI) ✅
- Création du "Dashboard" principal avec les composants Shadcn (Cards, Badges pour le statut, Boutons d'action).
- Modale ou Page pour ajouter un nouveau projet (Input chemin, scan automatique).
- Bouton "Aurore" global (Démarrer tout).
- Améliorations UX (Cognitive Walkthrough) et Terminal global de logs.

## Phase 4 : Le Moteur d'Exécution (Process Spawner)
- Intégrer `bun:spawn` pour démarrer physiquement les projets.
- Capturer les logs.
- (Optionnel/Futur) : Mettre en place des WebSockets pour streamer les logs en direct depuis Bun vers le Frontend React sans recharger la page.

## Phase 5 : Période 2 - Lanceur d'applications (App Launcher) 🚀
- **Objectif** : Faire d'EOS le point central pour démarrer la journée.
- Intégrer la gestion et le lancement de différentes applications de bureau créées (ex: Aegis).
- Ajouter une section dédiée dans l'interface pour lister et exécuter ces applications indépendantes depuis le Dashboard.

## Dette technique & Points d'attention futurs
- La gestion des processus orphelins (s'assurer que quand on quitte EOS, les sous-processus sont bien tués ou laissés vivants selon le choix de l'utilisateur).
