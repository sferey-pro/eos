import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import db, { getProjectById, insertProject } from "./db";
import { startProject, stopProject, getProjectLogs } from "./engine";
import type { Project } from "./schemas";

describe("Execution Engine", () => {
	beforeEach(() => {
		db.run("DELETE FROM projects");
	});

	afterEach(() => {
		db.run("DELETE FROM projects");
	});

	test("should start and stop a project", async () => {
		const project: Project = {
			id: "test-proj-1",
			name: "Echo Test",
			path: ".",
			type: "bun",
			command: "echo 'hello world'",
			status: "stopped",
			dependsOn: [],
			healthcheck: { type: "none" },
		};
		insertProject(project);

		// Start the project
		startProject("test-proj-1");

		const runningProj = getProjectById("test-proj-1");
		expect(runningProj?.status).toBe("running");

		// Give it a tiny bit of time to execute the command and capture logs
		await Bun.sleep(100);

		const logs = getProjectLogs("test-proj-1");
		expect(logs).toContain("hello world");

		// Stop it manually (even if echo finishes instantly, the engine should handle stop safely)
		stopProject("test-proj-1");

		const stoppedProj = getProjectById("test-proj-1");
		expect(stoppedProj?.status).toBe("stopped");
	});

	test("should mark project as error if command fails", async () => {
		const project: Project = {
			id: "test-proj-2",
			name: "Fail Test",
			path: ".",
			type: "bun",
			command: "exit 1",
			status: "stopped",
			dependsOn: [],
			healthcheck: { type: "none" },
		};
		insertProject(project);

		startProject("test-proj-2");

		// Wait for process to exit
		await Bun.sleep(100);

		const failedProj = getProjectById("test-proj-2");
		expect(failedProj?.status).toBe("error");
	});
});
