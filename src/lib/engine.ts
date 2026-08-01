import type { Subprocess } from "bun";
import { getProjectById, updateProject } from "./db";

const processes = new Map<string, Subprocess>();
const projectLogs = new Map<string, string[]>();

export function startProject(projectId: string) {
	const project = getProjectById(projectId);
	if (!project) throw new Error("Project not found");
	if (processes.has(projectId)) {
		console.warn(`[Engine] Project ${projectId} is already running`);
		return;
	}

	project.status = "starting";
	updateProject(project);

	// Using sh -c allows running complex commands like `docker compose up` or npm scripts
	const cmd = ["sh", "-c", project.command];

	const proc = Bun.spawn(cmd, {
		cwd: project.path,
		stdout: "pipe",
		stderr: "pipe",
		onExit: (_proc, exitCode, _signalCode, _error) => {
			console.log(`[Engine] Process ${projectId} exited with code ${exitCode}`);
			const p = getProjectById(projectId);
			if (p) {
				p.status = exitCode === 0 ? "stopped" : "error";
				updateProject(p);
			}
			processes.delete(projectId);
		},
	});

	processes.set(projectId, proc);

	const logs = [
		`[EOS Engine] Starting ${project.name}...\n> ${project.command}\n\n`,
	];
	projectLogs.set(projectId, logs);

	const readStream = async (stream: ReadableStream, prefix: string) => {
		const reader = stream.getReader();
		const decoder = new TextDecoder();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const text = decoder.decode(value);
				logs.push(`[${prefix}] ${text}`);
				if (logs.length > 1000) {
					// Keep memory in check, retain last 1000 lines/chunks
					logs.splice(0, logs.length - 1000);
				}
			}
		} catch (e) {
			console.error(`[Engine] Error reading stream for ${projectId}`, e);
		}
	};

	if (proc.stdout) readStream(proc.stdout, "OUT");
	if (proc.stderr) readStream(proc.stderr, "ERR");

	// Temporarily set to 'running' immediately.
	// Healthchecks will refine this in a future phase.
	project.status = "running";
	updateProject(project);
}

export function stopProject(projectId: string) {
	const proc = processes.get(projectId);
	if (proc) {
		proc.kill();
		processes.delete(projectId);
	}
	const project = getProjectById(projectId);
	if (project) {
		project.status = "stopped";
		updateProject(project);
	}
}

export function getProjectLogs(projectId: string): string {
	const logs = projectLogs.get(projectId);
	if (!logs) return "[EOS Engine] No logs available.";
	return logs.join("");
}
