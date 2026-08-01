import { z } from "zod";

// Enum pour le statut visuel du projet
export const ProjectStatusSchema = z.enum([
	"stopped",
	"starting",
	"running",
	"error",
]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

// Enum pour le type de projet détecté par le scanner
export const ProjectTypeSchema = z.enum(["npm", "bun", "docker", "unknown"]);
export type ProjectType = z.infer<typeof ProjectTypeSchema>;

// Schéma complet d'un Projet EOS
export const ProjectSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, "Le nom du projet est requis"),
	path: z.string().min(1, "Le chemin du projet est requis"),
	subFolder: z.string().optional(), // Si la configuration est dans un sous-dossier
	type: ProjectTypeSchema, // Le type technique détecté (ex: npm, docker)
	command: z.string(), // La commande complète pour le lancer (ex: "npm run dev")
	status: ProjectStatusSchema.default("stopped"),
});

export type Project = z.infer<typeof ProjectSchema>;

// Schéma pour le fichier de sauvegarde local (eos-projects.json)
export const EosConfigSchema = z.object({
	version: z.number().default(1),
	projects: z.array(ProjectSchema),
});

export type EosConfig = z.infer<typeof EosConfigSchema>;
