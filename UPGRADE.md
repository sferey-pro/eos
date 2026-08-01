# Roadmap & Mises à Jour (UPGRADE.md)

Ce document suit l'évolution technique du projet, les étapes à venir, et la dette technique à résoudre.

## Phase 1 : Configuration et Architecture de base ✅
- [x] Initialisation React / Bun / Tailwind v4.
- [x] Configuration Qualité (Biome, Husky, Lint-staged).
- [x] Outils métiers (Zod, React Router).
- [x] Rédaction du CONTEXT.md, README.md, UPGRADE.md.

## Phase 2 : Modélisation et Scanner (À FAIRE)
- **Modèle de données** : Créer les schémas Zod pour représenter un "Projet" (nom, chemin, commande, statut).
- **Stockage local** : Mettre en place la lecture/écriture du fichier `eos-projects.json` via l'API Bun.
- **Scanner IA/Logique** : Développer l'utilitaire backend (`src/lib/scanner.ts`) capable de lire un dossier pour détecter les `package.json`, `docker-compose.yml`, etc.

## Phase 3 : Interface Utilisateur (UI)
- Création du "Dashboard" principal avec les composants Shadcn (Cards, Badges pour le statut, Boutons d'action).
- Modale ou Page pour ajouter un nouveau projet (Input chemin, scan automatique).
- Bouton "Aurore" global (Démarrer tout).

## Phase 4 : Le Moteur d'Exécution (Process Spawner)
- Intégrer `bun:spawn` pour démarrer physiquement les projets.
- Capturer les logs.
- (Optionnel/Futur) : Mettre en place des WebSockets pour streamer les logs en direct depuis Bun vers le Frontend React sans recharger la page.

## Dette technique & Points d'attention futurs
- La gestion des processus orphelins (s'assurer que quand on quitte EOS, les sous-processus sont bien tués ou laissés vivants selon le choix de l'utilisateur).
