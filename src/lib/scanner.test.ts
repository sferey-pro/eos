import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { scanDirectory } from "./scanner";

describe("scanner", () => {
	let tempDir: string;

	beforeAll(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "eos-scanner-test-"));

		// Create docker-compose.yml
		await fs.writeFile(
			path.join(tempDir, "docker-compose.yml"),
			`
services:
  web:
    ports:
      - "8080:80"
  db:
    ports:
      - "5432:5432"
`,
		);

		// Create Makefile
		await fs.writeFile(
			path.join(tempDir, "Makefile"),
			`
start:
\techo "Starting..."
build:
\techo "Building..."
`,
		);

		// Create package.json
		await fs.writeFile(
			path.join(tempDir, "package.json"),
			JSON.stringify({
				scripts: {
					dev: "vite",
					test: "bun test",
				},
			}),
		);
	});

	afterAll(async () => {
		await fs.rm(tempDir, { recursive: true, force: true });
	});

	test("devrait détecter les services docker-compose", async () => {
		const proposals = await scanDirectory(tempDir);
		const dockerProposals = proposals.filter((p) => p.type === "docker");

		expect(dockerProposals.length).toBe(2);
		expect(dockerProposals).toContainEqual(
			expect.objectContaining({
				name: "[Docker] web",
				command: "docker compose up -d web",
				healthcheck: { type: "tcp", target: "8080" },
			}),
		);
		expect(dockerProposals).toContainEqual(
			expect.objectContaining({
				name: "[Docker] db",
				command: "docker compose up -d db",
				healthcheck: { type: "tcp", target: "5432" },
			}),
		);
	});

	test("devrait détecter les cibles Makefile", async () => {
		const proposals = await scanDirectory(tempDir);
		const makeProposals = proposals.filter((p) => p.type === "make");

		expect(makeProposals.length).toBe(2);
		expect(makeProposals).toContainEqual(
			expect.objectContaining({
				name: "[Make] start",
				command: "make start",
				healthcheck: { type: "none" },
			}),
		);
		expect(makeProposals).toContainEqual(
			expect.objectContaining({
				name: "[Make] build",
				command: "make build",
				healthcheck: { type: "none" },
			}),
		);
	});

	test("devrait détecter les scripts package.json (Bun/NPM)", async () => {
		const proposals = await scanDirectory(tempDir);
		const bunProposals = proposals.filter((p) => p.type === "bun");

		expect(bunProposals.length).toBe(2);
		expect(bunProposals).toContainEqual(
			expect.objectContaining({
				name: "[Bun] dev",
				command: "bun run dev",
				healthcheck: { type: "none" },
			}),
		);
		expect(bunProposals).toContainEqual(
			expect.objectContaining({
				name: "[Bun] test",
				command: "bun run test",
				healthcheck: { type: "none" },
			}),
		);
	});
});
