import { describe, expect, test } from "bun:test";
import { PresetSchema, ProjectSchema } from "./schemas";

describe("schemas", () => {
	describe("ProjectSchema", () => {
		test("validates a correct project", () => {
			const project = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				name: "Test Project",
				path: "/path/to/project",
				type: "bun",
				command: "bun start",
			};
			const result = ProjectSchema.safeParse(project);
			expect(result.success).toBe(true);
		});

		test("fails on invalid UUID", () => {
			const project = {
				id: "invalid-uuid",
				name: "Test Project",
				path: "/path/to/project",
				type: "bun",
				command: "bun start",
			};
			const result = ProjectSchema.safeParse(project);
			expect(result.success).toBe(false);
		});

		test("fails on missing required fields", () => {
			const project = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				path: "/path/to/project",
				type: "bun",
				command: "bun start",
			};
			const result = ProjectSchema.safeParse(project);
			expect(result.success).toBe(false);
		});

		test("provides default values", () => {
			const project = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				name: "Test Project",
				path: "/path/to/project",
				type: "bun",
				command: "bun start",
			};
			const parsed = ProjectSchema.parse(project);
			expect(parsed.status).toBe("stopped");
			expect(parsed.dependsOn).toEqual([]);
			expect(parsed.healthcheck).toEqual({ type: "none" });
		});
	});

	describe("PresetSchema", () => {
		test("validates a correct preset", () => {
			const preset = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				name: "Test Preset",
				projectIds: ["123e4567-e89b-12d3-a456-426614174000"],
			};
			const result = PresetSchema.safeParse(preset);
			expect(result.success).toBe(true);
		});

		test("fails when projectIds is empty", () => {
			const preset = {
				id: "123e4567-e89b-12d3-a456-426614174000",
				name: "Test Preset",
				projectIds: [],
			};
			const result = PresetSchema.safeParse(preset);
			expect(result.success).toBe(false);
		});
	});
});
