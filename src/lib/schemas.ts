import { z } from "zod";

// Enum pour le statut visuel et technique du projet
export const ProjectStatusSchema = z.enum([
	"stopped",
	"starting",
	"running",
	"healthy",
	"error",
	"waiting",
]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

// Enum pour le type de projet
export const ProjectTypeSchema = z.enum([
	"npm",
	"bun",
	"docker",
	"make",
	"unknown",
]);
export type ProjectType = z.infer<typeof ProjectTypeSchema>;

// Schéma pour le Healthcheck d'un service
export const HealthcheckSchema = z.object({
	type: z.enum(["none", "http", "tcp"]),
	target: z.string().optional(), // ex: "http://localhost:3000/health" (http) ou "5432" (tcp)
});
export type Healthcheck = z.infer<typeof HealthcheckSchema>;

// Schéma complet d'un Projet EOS
export const ProjectSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, "Le nom du projet est requis"),
	path: z.string().min(1, "Le chemin du projet est requis"),
	subFolder: z.string().optional(),
	type: ProjectTypeSchema,
	command: z.string(),
	status: ProjectStatusSchema.default("stopped"),
	dependsOn: z.array(z.string()).default([]), // IDs des projets dont il dépend
	healthcheck: HealthcheckSchema.default({ type: "none" }),
});
export type Project = z.infer<typeof ProjectSchema>;

export const AppSchema = z.object({
	id: z
		.string()
		.uuid()
		.default(() => crypto.randomUUID()),
	name: z.string().min(1, "Name is required"),
	path: z.string().min(1, "Path is required"),
	command: z.string().min(1, "Command is required"),
	url: z.string().min(1, "URL is required"),
	icon: z.string().default("Box"),
	status: z
		.enum(["stopped", "starting", "running", "healthy", "error", "waiting"])
		.default("stopped"),
});
export type App = z.infer<typeof AppSchema>;

// Schéma d'un Preset (Profil de lancement)
export const PresetSchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1, "Le nom du preset est requis"),
	projectIds: z
		.array(z.string())
		.min(1, "Un preset doit contenir au moins un projet"),
});
export type Preset = z.infer<typeof PresetSchema>;
