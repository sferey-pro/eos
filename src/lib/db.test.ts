import { beforeEach, describe, expect, test } from "bun:test";
import db, {
	getPresets,
	getProjects,
	insertPreset,
	insertProject,
	updateProject,
} from "./db";
import type { Preset, Project } from "./schemas";

describe("db", () => {
	beforeEach(() => {
		db.run("DELETE FROM projects");
		db.run("DELETE FROM presets");
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
});
