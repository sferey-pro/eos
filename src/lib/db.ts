import { Database } from "bun:sqlite";
import type { Healthcheck, Preset, Project, App } from "./schemas";

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

db.run(`
  CREATE TABLE IF NOT EXISTS apps (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    command TEXT NOT NULL,
    url TEXT NOT NULL,
    icon TEXT DEFAULT 'Box',
    status TEXT DEFAULT 'stopped'
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

export function getProjectById(id: string): Project | undefined {
	const query = db.query("SELECT * FROM projects WHERE id = $id");
	const row = query.get({ $id: id }) as any;
	if (!row) return undefined;
	return {
		...row,
		dependsOn: JSON.parse(row.dependsOn),
		healthcheck: JSON.parse(row.healthcheck) as Healthcheck,
	};
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

// --- APPS ---
export function getApps(): App[] {
	const query = db.query("SELECT * FROM apps");
	return query.all() as App[];
}

export function getAppById(id: string): App | undefined {
	const query = db.query("SELECT * FROM apps WHERE id = $id");
	return query.get({ $id: id }) as App | undefined;
}

export function updateApp(app: App): void {
	const query = db.query(`
    UPDATE apps
    SET name = $name, path = $path, command = $command, url = $url, icon = $icon, status = $status
    WHERE id = $id
  `);
	query.run({
		$id: app.id,
		$name: app.name,
		$path: app.path,
		$command: app.command,
		$url: app.url,
		$icon: app.icon,
		$status: app.status,
	});
}

export function insertApp(app: App): void {
	const query = db.query(`
    INSERT INTO apps (id, name, path, command, url, icon, status)
    VALUES ($id, $name, $path, $command, $url, $icon, $status)
  `);
	query.run({
		$id: app.id,
		$name: app.name,
		$path: app.path,
		$command: app.command,
		$url: app.url,
		$icon: app.icon,
		$status: app.status,
	});
}

export default db;
