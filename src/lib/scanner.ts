import { join } from "node:path";
import { parse } from "yaml";
import type { Healthcheck, Project } from "./schemas";

export type ProjectProposal = Omit<Project, "id" | "status" | "dependsOn">;

/**
 * Scan un répertoire à la recherche de fichiers docker-compose et Makefile
 * et propose une liste de configurations de "Projets" EOS.
 */
export async function scanDirectory(
	targetPath: string,
): Promise<ProjectProposal[]> {
	const proposals: ProjectProposal[] = [];

	// 1. SCAN DOCKER COMPOSE
	const composeFiles = [
		"docker-compose.yml",
		"docker-compose.yaml",
		"compose.yml",
		"compose.yaml",
	];
	let composeContent = "";

	for (const filename of composeFiles) {
		const file = Bun.file(join(targetPath, filename));
		if (await file.exists()) {
			composeContent = await file.text();
			break;
		}
	}

	if (composeContent) {
		try {
			const parsed = parse(composeContent) as {
				services?: Record<string, { ports?: unknown[] }>;
			};
			if (parsed?.services) {
				// Parcourir chaque service défini dans le docker-compose
				for (const [serviceName, serviceDef] of Object.entries(
					parsed.services,
				)) {
					let healthcheck: Healthcheck = { type: "none" };

					if (
						serviceDef.ports &&
						Array.isArray(serviceDef.ports) &&
						serviceDef.ports.length > 0
					) {
						const firstPortDef = serviceDef.ports[0];
						if (typeof firstPortDef === "string") {
							const parts = firstPortDef.split(":");
							if (parts.length > 0) {
								// @ts-expect-error Zod enums validation is flexible enough
								healthcheck = { type: "tcp", target: parts[0] };
							}
						}
					}

					proposals.push({
						name: `[Docker] ${serviceName}`,
						path: targetPath,
						type: "docker",
						command: `docker compose up -d ${serviceName}`,
						healthcheck: healthcheck,
					});
				}
			}
		} catch (error) {
			console.error("Erreur lors de l'analyse du fichier yaml:", error);
		}
	}

	// 2. SCAN MAKEFILE
	const makefile = Bun.file(join(targetPath, "Makefile"));
	if (await makefile.exists()) {
		try {
			const makefileContent = await makefile.text();

			// Regex pour trouver les cibles Makefile (ex: "start:", "up:", "build-worker:")
			const targetRegex = /^([a-zA-Z0-9_-]+):/gm;
			let match: RegExpExecArray | null;

			match = targetRegex.exec(makefileContent);
			while (match !== null) {
				const targetName = match[1];
				if (targetName) {
					proposals.push({
						name: `[Make] ${targetName}`,
						path: targetPath,
						type: "make",
						command: `make ${targetName}`,
						healthcheck: { type: "none" },
					});
				}
				match = targetRegex.exec(makefileContent);
			}
		} catch (error) {
			console.error("Erreur lors de l'analyse du Makefile:", error);
		}
	}

	// 3. SCAN PACKAGE.JSON
	const packageJson = Bun.file(join(targetPath, "package.json"));
	if (await packageJson.exists()) {
		try {
			const packageContent = await packageJson.json();
			if (packageContent.scripts) {
				for (const scriptName of Object.keys(packageContent.scripts)) {
					proposals.push({
						name: `[Bun] ${scriptName}`,
						path: targetPath,
						type: "bun",
						command: `bun run ${scriptName}`,
						healthcheck: { type: "none" },
					});
				}
			}
		} catch (error) {
			console.error("Erreur lors de l'analyse du package.json:", error);
		}
	}

	return proposals;
}
