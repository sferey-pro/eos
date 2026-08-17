# Contexte du Projet EOS (Environment Orchestration System)

Ce document centralise les règles métier, les décisions architecturales et les standards de développement du projet EOS. Il doit être lu par tout nouveau contributeur (ou assistant IA).

## 1. Philosophie
- **Ne pas réinventer la roue** : Utilisation exclusive des bibliothèques standards et des fonctionnalités natives.
- **Interface Centralisée** : L'interface se concentre sur une unique page (`HomePage.tsx`) sans routeur complexe, pour une réactivité immédiate.
- **Thématique UI** : Un soin tout particulier est accordé à l'interface, incluant un thème clair, sombre, et un thème "Retro" très poussé (style Far Cry Blood Dragon, Synthwave, Néon).

## 2. Fonctionnement Métier (Le Moteur EOS)
- **Scan Intelligent** : EOS parcourt les dossiers en cherchant des fichiers de configuration (`docker-compose.yml`, `package.json`, `Makefile`).
- **Backend Bun (Super-Orchestrateur)** : Le backend gère le cycle de vie via `Bun.spawn`, streame les logs via **WebSockets**, et gère la fermeture propre des enfants (Graceful Shutdown sur SIGTERM/SIGINT).
- **Healthchecks Actifs & Métriques** : Le système ping les services (HTTP/TCP) pour connaître leur santé, et remonte les métriques (CPU/RAM) des conteneurs.
- **Entités** : EOS gère des **Projets** (processus backend locaux), des **Apps** (applications web ou liens à afficher via IFrame), et des **Presets** (groupes de projets à démarrer ensemble en 1 clic).
- **Persistance ultra-rapide** : L'état est stocké dans une base **SQLite** native (`bun:sqlite`), optimisée (mode WAL, Mmap).

## 3. Conventions de Développement
- **Nommage React** : `PascalCase.tsx` pour composants, `kebab-case.tsx` pour composants UI purs.
- **Validation** : Toute donnée entrante est validée via **Zod**.
- **Typage** : TypeScript strict. Aucun `any` toléré.
- **Optimisation** : Les Hooks React (`useMemo`, `useCallback`) doivent être intelligemment employés pour minimiser les re-rendus. L'accessibilité (a11y) est obligatoire.
- **Tests** : Le projet est couvert de tests rigoureux utilisant `bun:test` couplé à `happy-dom` et `@testing-library/react`.

## 4. Architecture Dossiers
- `/src/pages/` : Page principale (`HomePage.tsx`).
- `/src/components/ui/` : Composants purs (Shadcn).
- `/src/components/` : Composants partagés (Modales, Terminal, ThemeToggle).
- `/src/lib/` : Moteur d'exécution, scanner, db, healthcheck, schémas.
