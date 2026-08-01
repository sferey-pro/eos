import { Database } from "bun:sqlite";
import type { Project } from "./schemas";

// Initialise la connexion SQLite.
// Le fichier eos.sqlite sera créé à la racine du projet s'il n'existe pas.
const db = new Database("eos.sqlite", { create: true });

// Activer le mode WAL (Write-Ahead Logging) pour de meilleures performances
db.run("PRAGMA journal_mode = WAL;");

// Création de la table 'projects' si elle n'existe pas
db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    subFolder TEXT,
    type TEXT NOT NULL,
    command TEXT NOT NULL,
    status TEXT DEFAULT 'stopped'
  );
`);

export function getProjects(): Project[] {
	const query = db.query("SELECT * FROM projects");
	return query.all() as Project[];
}

export function insertProject(project: Project): void {
	const query = db.query(`
    INSERT INTO projects (id, name, path, subFolder, type, command, status)
    VALUES ($id, $name, $path, $subFolder, $type, $command, $status)
  `);

	query.run({
		$id: project.id,
		$name: project.name,
		$path: project.path,
		$subFolder: project.subFolder ?? null,
		$type: project.type,
		$command: project.command,
		$status: project.status,
	});
}

export function updateProjectStatus(id: string, status: string): void {
	const query = db.query("UPDATE projects SET status = $status WHERE id = $id");
	query.run({ $id: id, $status: status });
}

export function deleteProject(id: string): void {
	const query = db.query("DELETE FROM projects WHERE id = $id");
	query.run({ $id: id });
}

export default db;
