# Roadmap & Mises à Jour (UPGRADE.md)

Ce document suit l'évolution technique du projet, les étapes à venir, et la dette technique à résoudre.

## Phase 1 : Configuration et Architecture de base ✅
- [x] Initialisation React / Bun / Tailwind v4.
- [x] Configuration Qualité (Biome, Husky, Lint-staged).
- [x] Outils métiers (Zod). *Note: React Router a été retiré au profit d'une interface Dashboard unique.*
- [x] Rédaction du CONTEXT.md, README.md, UPGRADE.md.

## Phase 2 : Modélisation et Scanner ✅
- [x] **Modèle de données** : Schémas Zod pour représenter "Project", "App", et "Preset".
- [x] **Stockage local** : Base de données **SQLite** (`bun:sqlite`) ultra-optimisée avec PRAGMA (Memory Temp Store, WAL).
- [x] **Scanner IA/Logique** : Détection intelligente (`package.json`, `docker-compose.yml`, `Makefile`).

## Phase 3 : Interface Utilisateur (UI) ✅
- [x] Dashboard principal unique avec composants Shadcn.
- [x] Modales avancées : Ajout de projets, Ajout d'Apps, Gestionnaire de Presets.
- [x] **Thème Retro** : Esthétique "Far Cry Blood Dragon" (Synthwave, néon, scanlines).
- [x] Accessibilité totale (a11y) et optimisation des rendus (useMemo, useCallback).

## Phase 4 : Le Moteur d'Exécution (Process Spawner) ✅
- [x] Intégration `bun:spawn` pour démarrer physiquement les projets (Docker, Bun, Make).
- [x] Gestion des logs très performante (buffer en mémoire géré avec `splice`).
- [x] Streaming en direct via **WebSockets** depuis Bun vers React.
- [x] Graceful Shutdown (SIGINT/SIGTERM) pour tuer proprement les sous-processus.

## Phase 5 : Période 2 - Lanceur d'applications (App Launcher) ✅
- [x] Ajout de l'entité "App" (lancement d'applications web tierces).
- [x] Visualisation intégrée via **IFrame** ou accès par nouvel onglet (Web / Logs).
- [x] Suivi des métriques CPU/RAM des conteneurs via `docker stats`.

## Phase 6 : Evolutions Futures & Dette Technique ⏳
- [ ] Intégration d'une Command Palette (ex: type `cmd+k` pour naviguer).
- [ ] Étendre la récupération des métriques (CPU/RAM) aux processus non-Docker.
- [ ] Gestion des configurations et variables d'environnement (`.env`) directement depuis l'interface.
