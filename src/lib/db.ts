import { Database } from "bun:sqlite";
import type { Healthcheck, Preset, Project } from "./schemas";

const dbPath = process.env.NODE_ENV === "test" ? ":memory:" : "eos.sqlite";
const db = new Database(dbPath, { create: true });
db.run("PRAGMA journal_mode = WAL;");

db.run(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    subFolder TEXT,
    type TEXT NOT NULL,
    command TEXT NOT NULL,
    status TEXT DEFAULT 'stopped',
    dependsOn TEXT DEFAULT '[]',
    healthcheck TEXT DEFAULT '{"type":"none"}'
  );
`);

db.run(`
  CREATE TABLE IF NOT EXISTS presets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    projectIds TEXT NOT NULL
  );
`);

// --- PROJETS ---
export function getProjects(): Project[] {
	const query = db.query("SELECT * FROM projects");
	const rows = query.all() as any[];
	return rows.map((row) => ({
		...row,
		dependsOn: JSON.parse(row.dependsOn),
		healthcheck: JSON.parse(row.healthcheck) as Healthcheck,
	}));
}

export function updateProject(project: Project): void {
	const query = db.query(`
    UPDATE projects
    SET name = $name, path = $path, subFolder = $subFolder, type = $type,
        command = $command, status = $status, dependsOn = $dependsOn, healthcheck = $healthcheck
    WHERE id = $id
  `);
	query.run({
		$id: project.id,
		$name: project.name,
		$path: project.path,
		$subFolder: project.subFolder ?? null,
		$type: project.type,
		$command: project.command,
		$status: project.status,
		$dependsOn: JSON.stringify(project.dependsOn),
		$healthcheck: JSON.stringify(project.healthcheck),
	});
}

export function insertProject(project: Project): void {
	const query = db.query(`
    INSERT INTO projects (id, name, path, subFolder, type, command, status, dependsOn, healthcheck)
    VALUES ($id, $name, $path, $subFolder, $type, $command, $status, $dependsOn, $healthcheck)
  `);
	query.run({
		$id: project.id,
		$name: project.name,
		$path: project.path,
		$subFolder: project.subFolder ?? null,
		$type: project.type,
		$command: project.command,
		$status: project.status,
		$dependsOn: JSON.stringify(project.dependsOn),
		$healthcheck: JSON.stringify(project.healthcheck),
	});
}

// --- PRESETS ---
export function getPresets(): Preset[] {
	const query = db.query("SELECT * FROM presets");
	const rows = query.all() as any[];
	return rows.map((row) => ({
		...row,
		projectIds: JSON.parse(row.projectIds),
	}));
}

export function insertPreset(preset: Preset): void {
	const query = db.query(`
    INSERT INTO presets (id, name, projectIds)
    VALUES ($id, $name, $projectIds)
  `);
	query.run({
		$id: preset.id,
		$name: preset.name,
		$projectIds: JSON.stringify(preset.projectIds),
	});
}

export default db;
