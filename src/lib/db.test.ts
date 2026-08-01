import { beforeEach, describe, expect, test } from "bun:test";
import db, {
	getPresets,
	getProjects,
	insertPreset,
	insertProject,
	updateProject,
	updatePreset,
	deletePreset,
	getApps,
	getAppById,
	insertApp,
	updateApp,
	clearAllData,
} from "./db";
import type { Preset, Project, App } from "./schemas";

describe("db", () => {
	beforeEach(() => {
		db.run("DELETE FROM projects");
		db.run("DELETE FROM presets");
		db.run("DELETE FROM apps");
	});

	test("inserts and retrieves a project", () => {
		const project: Project = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Project",
			path: "/test",
			type: "bun",
			command: "bun run dev",
			status: "stopped",
			dependsOn: [],
			healthcheck: { type: "none" },
		};

		insertProject(project);

		const projects = getProjects();
		expect(projects).toHaveLength(1);
		expect(projects[0]).toEqual({ ...project, subFolder: undefined });
	});

	test("updates an existing project", () => {
		const project: Project = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Project",
			path: "/test",
			type: "bun",
			command: "bun run dev",
			status: "stopped",
			dependsOn: [],
			healthcheck: { type: "none" },
		};

		insertProject(project);

		const updatedProject = { ...project, status: "running" as const };
		updateProject(updatedProject);

		const projects = getProjects();
		expect(projects).toHaveLength(1);
		expect(projects[0]?.status).toBe("running");
	});

	test("inserts and retrieves a preset", () => {
		const preset: Preset = {
			id: "123e4567-e89b-12d3-a456-426614174000",
			name: "Test Preset",
			projectIds: ["123e4567-e89b-12d3-a456-426614174000"],
		};

		insertPreset(preset);

		const presets = getPresets();
		expect(presets).toHaveLength(1);
		expect(presets[0]).toEqual(preset);
	});

	test("updates an existing preset", () => {
		const preset: Preset = { id: "p-1", name: "P1", projectIds: ["1"] };
		insertPreset(preset);
		updatePreset("p-1", { name: "P1 Updated" });
		const presets = getPresets();
		expect(presets[0]?.name).toBe("P1 Updated");
	});

	test("deletes a preset", () => {
		const preset: Preset = { id: "p-2", name: "P2", projectIds: ["2"] };
		insertPreset(preset);
		deletePreset("p-2");
		expect(getPresets()).toHaveLength(0);
	});

	test("inserts, retrieves and updates apps", () => {
		const app: App = { id: "a-1", name: "A1", path: "/app1", command: "start", url: "http://app", icon: "Box", status: "stopped" };
		insertApp(app);
		expect(getApps()).toHaveLength(1);
		expect(getAppById("a-1")).toEqual(app);

		updateApp({ ...app, status: "running" });
		expect(getAppById("a-1")?.status).toBe("running");
	});

	test("clearAllData", () => {
		insertPreset({ id: "p-3", name: "P3", projectIds: [] });
		clearAllData();
		expect(getPresets()).toHaveLength(0);
	});
});
