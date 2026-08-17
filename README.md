<div align="center">
  <img src="public/eos-logo.jpg" alt="EOS Logo" width="150" />
</div>

# EOS - Environment Orchestration System

> Dans la mythologie grecque, Éos est la déesse de l'Aurore. Tout comme elle illumine le ciel et réveille le monde, le projet **EOS** réveille et démarre l'intégralité de votre environnement de développement distribué. Projet frère de *Aegis* (agrégateur de vulnérabilités).

**EOS** est un orchestrateur local ultra-rapide conçu pour les développeurs. Il permet, en **1 seul clic**, de démarrer, gérer et monitorer l'ensemble de votre environnement de développement (Projets Docker, Bun, Make, ainsi que vos Apps web tierces).

## 🚀 Fonctionnalités Principales

- **Détection Automatique** : Scanne les dossiers et trouve comment lancer vos applications (`docker-compose.yml`, `package.json`, `Makefile`).
- **Presets & Lancement Groupé** : Créez des configurations pour démarrer tout un écosystème d'un seul clic.
- **App Launcher Intégré** : Lancez et visualisez vos applications web directement au sein d'une IFrame dans le dashboard.
- **Monitoring & Logs en direct** : Suivez la santé, la CPU/RAM, et visualisez les logs des terminaux streamés via WebSockets en temps réel.
- **Design "Maximum Effort"** : Interface fluide, accessible, avec des thèmes clair, sombre et un thème exclusif **"Retro"** (Synthwave, Néon).

## 🛠 Stack Technique

- **Moteur / Backend** : [Bun](https://bun.sh/) (Serveur natif, gestion `spawn`, streaming WebSocket, base de données SQLite embarquée et optimisée).
- **Frontend** : React 19 (Hooks optimisés), Tailwind CSS v4, [Shadcn UI](https://ui.shadcn.com/).
- **Validation & Qualité** : Zod, Biome, Husky.
- **Tests** : Couverture rigoureuse avec `bun:test` et `happy-dom`.

## 📦 Installation & Lancement

1. Installez les dépendances :
   ```bash
   bun install
   ```
2. Lancez EOS en mode développement (Frontend + Backend concurrent) :
   ```bash
   bun run dev
   ```
3. L'interface est disponible sur `http://localhost:3000`.

*Note: En cas d'arrêt (Ctrl+C), le backend effectue un "graceful shutdown" pour libérer proprement les processus enfants.*
