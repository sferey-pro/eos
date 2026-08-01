import { join } from "path";
import { parse } from "yaml";
import type { Healthcheck, Project } from "./schemas";

export type ProjectProposal = Omit<Project, "id" | "status" | "dependsOn">;

/**
 * Scan un répertoire à la recherche de fichiers docker-compose
 * et propose une liste de configurations de "Projets" EOS.
 */
export async function scanDirectory(
	targetPath: string,
): Promise<ProjectProposal[]> {
	const proposals: ProjectProposal[] = [];

	// Chercher docker-compose.yml ou docker-compose.yaml
	const possibleFiles = [
		"docker-compose.yml",
		"docker-compose.yaml",
		"compose.yml",
		"compose.yaml",
	];
	let composeContent = "";

	for (const filename of possibleFiles) {
		const file = Bun.file(join(targetPath, filename));
		if (await file.exists()) {
			composeContent = await file.text();
			break;
		}
	}

	if (!composeContent) {
		// Si ce n'est pas un projet Docker, on pourrait scanner package.json plus tard.
		return proposals;
	}

	try {
		const parsed = parse(composeContent);
		if (!parsed || !parsed.services) {
			return proposals;
		}

		// Parcourir chaque service défini dans le docker-compose
		for (const [serviceName, serviceDef] of Object.entries<any>(
			parsed.services,
		)) {
			// Essayer de deviner un healthcheck TCP si des ports sont exposés
			let healthcheck: Healthcheck = { type: "none" };

			if (
				serviceDef.ports &&
				Array.isArray(serviceDef.ports) &&
				serviceDef.ports.length > 0
			) {
				// Ex: "5432:5432" ou "8080:80"
				const firstPortDef = serviceDef.ports[0];
				if (typeof firstPortDef === "string") {
					const parts = firstPortDef.split(":");
					if (parts.length > 0) {
						healthcheck = { type: "tcp", target: parts[0] }; // On ping le port local (host)
					}
				}
			}

			proposals.push({
				name: serviceName,
				path: targetPath,
				type: "docker",
				// La commande standard sans interactivité pour démarrer juste ce service
				command: `docker compose up -d ${serviceName}`,
				healthcheck: healthcheck,
			});
		}
	} catch (error) {
		console.error("Erreur lors de l'analyse du fichier yaml:", error);
	}

	return proposals;
}
