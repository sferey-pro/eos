# Contexte du Projet EOS (Environment Orchestration System)

Ce document centralise les règles métier, les décisions architecturales et les standards de développement du projet EOS. Il doit être lu par tout nouveau contributeur (ou assistant IA).

## 1. Philosophie
- **Ne pas réinventer la roue** : Utilisation exclusive des bibliothèques standards et des fonctionnalités natives.
- Si un composant UI est nécessaire et existe dans **Shadcn UI**, il doit être utilisé (pas de création sur-mesure inutile).

## 2. Fonctionnement Métier (Le Moteur EOS)
- **Scan Intelligent** : Lorsqu'un utilisateur renseigne un chemin d'accès (et un éventuel sous-dossier), EOS doit parcourir le dossier pour déduire les commandes de démarrage pertinentes.
- **Backend Bun** : Le routage natif de Bun (`src/index.ts`) agit comme un proxy local. Il est responsable du "process spawning" (lancement des terminaux en arrière-plan) et de la récupération de la sortie standard (stdout/stderr).
- **Persistance** : La liste des projets configurés doit être sauvegardée localement (ex: dans un `eos-projects.json`) pour subsister aux redémarrages.

## 3. Conventions de Développement
- **Nommage React** : Les composants React métiers et les pages utilisent le `PascalCase.tsx`.
- **Nommage Shadcn** : Les composants générés dans `components/ui/` respectent le format par défaut `kebab-case.tsx`.
- **Hooks et Utilitaires** : Fichiers en `camelCase.ts`.
- **Validation** : Toute donnée entrante (chemin fourni par l'utilisateur, configuration JSON, API) **doit** être validée via **Zod**.
- **Typage** : Mode strict, aucun `any` toléré.

## 4. Architecture Dossiers
- `/src/pages/` : Vues principales de l'application (routage géré par React Router).
- `/src/components/ui/` : Composants purs (Shadcn).
- `/src/components/` : Composants partagés (complexes, métier).
- `/src/lib/` : Fonctions utilitaires, fetchers, configuration.
