import type { Subprocess, ServerWebSocket } from "bun";
import { getProjects, getProjectById, updateProject, getAppById, updateApp } from "./db";

const processes = new Map<string, Subprocess>();
const logProcesses = new Map<string, Subprocess>(); // For docker logs -f
const projectLogs = new Map<string, string[]>();
const wsSubscribers = new Map<string, Set<ServerWebSocket<any>>>();

export function subscribeToLogs(projectId: string, ws: ServerWebSocket<any>) {
	if (!wsSubscribers.has(projectId)) wsSubscribers.set(projectId, new Set());
	wsSubscribers.get(projectId)!.add(ws);
	
	// Send existing history
	const logs = projectLogs.get(projectId) || ["[EOS Engine] No logs available.\r\n"];
	ws.send(logs.join(""));
}

export function unsubscribeFromLogs(projectId: string, ws: ServerWebSocket<any>) {
	const subs = wsSubscribers.get(projectId);
	if (subs) {
		subs.delete(ws);
		if (subs.size === 0) wsSubscribers.delete(projectId);
	}
}

function broadcastLog(projectId: string, text: string) {
	let logs = projectLogs.get(projectId);
	if (!logs) {
		logs = [];
		projectLogs.set(projectId, logs);
	}
	logs.push(text);
	if (logs.length > 1000) logs.splice(0, logs.length - 1000);

	const subs = wsSubscribers.get(projectId);
	if (subs) {
		for (const ws of subs) {
			ws.send(text);
		}
	}
}

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
				// detached processes like `docker compose up -d` exit immediately with 0
				// we shouldn't mark them as stopped if they are docker types
				if (p.type !== "docker") {
					p.status = exitCode === 0 ? "stopped" : "error";
					updateProject(p);
				} else if (exitCode === 0) {
					// Container is created and running, now we can safely attach logs
					ensureLogStream(projectId);
					if (p.healthcheck?.type === "none") {
						p.status = "running";
						updateProject(p);
					}
				}
			}
			processes.delete(projectId);
		},
	});

	processes.set(projectId, proc);

	const logs = [
		`\r\n\x1b[36m[EOS Engine]\x1b[0m Starting ${project.name}...\r\n> ${project.command}\r\n\r\n`,
	];
	projectLogs.set(projectId, logs);
	// Broadcast initial log
	broadcastLog(projectId, logs[0] as string);

	const readStream = async (stream: ReadableStream, prefix: string) => {
		const reader = stream.getReader();
		const decoder = new TextDecoder();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const text = decoder.decode(value);
				// Replace newlines with \r\n for xterm and add prefix color
				const formattedText = text.replace(/\n/g, "\r\n");
				broadcastLog(projectId, `\x1b[33m[${prefix}]\x1b[0m ${formattedText}`);
			}
		} catch (e) {
			console.error(`[Engine] Error reading stream for ${projectId}`, e);
		}
	};

	if (proc.stdout) readStream(proc.stdout, "OUT");
	if (proc.stderr) readStream(proc.stderr, "ERR");

	// For Docker projects, we wait for 'up -d' to exit with 0 before spawning logs.
	// This ensures that we don't start tailing logs while images are still downloading.
}

export function stopProject(projectId: string) {
	const project = getProjectById(projectId);
	if (!project) return;

	// For Docker projects, we need to explicitly stop the service container
	if (project.type === "docker") {
		const parts = project.command.split(" ");
		const lastPart = parts[parts.length - 1];
		let serviceName = "";
		if (lastPart && !lastPart.startsWith("-") && lastPart !== "up") {
			serviceName = lastPart;
		}
		
		const stopCmd = ["docker", "compose", "stop"];
		if (serviceName) stopCmd.push(serviceName);

		console.log(`[Engine] Stopping docker service: ${serviceName || "all"}`);
		Bun.spawn(stopCmd, {
			cwd: project.path,
		});
	}

	const proc = processes.get(projectId);
	if (proc) {
		proc.kill();
		processes.delete(projectId);
	}
	const logProc = logProcesses.get(projectId);
	if (logProc) {
		logProc.kill();
		logProcesses.delete(projectId);
	}

	project.status = "stopped";
	updateProject(project);
}

export function startApp(appId: string) {
	const app = getAppById(appId);
	if (!app) throw new Error("App not found");
	if (processes.has(appId)) {
		console.warn(`[Engine] App ${appId} is already running`);
		return;
	}

	app.status = "starting";
	updateApp(app);

	const cmd = ["sh", "-c", app.command];
	const proc = Bun.spawn(cmd, {
		cwd: app.path,
		stdout: "pipe",
		stderr: "pipe",
		onExit: (_proc, exitCode, _signalCode, _error) => {
			console.log(`[Engine] App ${appId} exited with code ${exitCode}`);
			const a = getAppById(appId);
			if (a) {
				a.status = exitCode === 0 ? "stopped" : "error";
				updateApp(a);
			}
			processes.delete(appId);
		},
	});

	processes.set(appId, proc);

	const logs = [
		`\r\n\x1b[36m[EOS Engine]\x1b[0m Starting App ${app.name}...\r\n> ${app.command}\r\n\r\n`,
	];
	projectLogs.set(appId, logs);
	broadcastLog(appId, logs[0] as string);

	const readStream = async (stream: ReadableStream, prefix: string) => {
		const reader = stream.getReader();
		const decoder = new TextDecoder();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const text = decoder.decode(value);
				broadcastLog(appId, `\x1b[33m[${prefix}]\x1b[0m ${text.replace(/\n/g, "\r\n")}`);
			}
		} catch (e) {
			console.error(`[Engine] Error reading stream for ${appId}`, e);
		}
	};

	if (proc.stdout) readStream(proc.stdout, "OUT");
	if (proc.stderr) readStream(proc.stderr, "ERR");

	app.status = "running";
	updateApp(app);
}

export function stopApp(appId: string) {
	const proc = processes.get(appId);
	if (proc) {
		proc.kill();
		processes.delete(appId);
	}
	const app = getAppById(appId);
	if (app) {
		app.status = "stopped";
		updateApp(app);
	}
}

export function getProjectLogs(projectId: string): string {
	const logs = projectLogs.get(projectId);
	if (!logs) return "[EOS Engine] No logs available.";
	return logs.join("");
}

export async function getProjectMetrics(projectId: string): Promise<{ cpu: string, ram: string }> {
	const project = getProjectById(projectId);
	if (!project || project.status === "stopped" || project.status === "error") {
		return { cpu: "0%", ram: "0%" };
	}

	if (project.type === "docker") {
		try {
			// Obtenir les IDs des conteneurs via docker compose
			const psProc = Bun.spawn(["docker", "compose", "ps", "-q"], { cwd: project.path });
			const idsText = await new Response(psProc.stdout).text();
			const ids = idsText.split('\n').map(id => id.trim()).filter(Boolean);
			
			if (ids.length === 0) return { cpu: "0%", ram: "0%" };

			// Obtenir les stats pour ces IDs
			const statsProc = Bun.spawn(["docker", "stats", "--no-stream", "--format", "{{.CPUPerc}}::{{.MemPerc}}", ...ids]);
			const statsText = await new Response(statsProc.stdout).text();
			
			const lines = statsText.split('\n').filter(Boolean);
			let totalCpu = 0;
			let totalRam = 0;
			
			for (const line of lines) {
				const [cpu, ram] = line.split("::");
				if (cpu) totalCpu += parseFloat(cpu.replace('%', '')) || 0;
				if (ram) totalRam += parseFloat(ram.replace('%', '')) || 0;
			}
			
			return { 
				cpu: totalCpu.toFixed(1) + "%", 
				ram: totalRam.toFixed(1) + "%" 
			};
		} catch (e) {
			console.error("[Engine] Error getting docker metrics for", projectId, e);
			return { cpu: "N/A", ram: "N/A" };
		}
	}
	
	// Placeholder for non-docker projects (Node/Bun/Make) using PID later
	return { cpu: "N/A", ram: "N/A" };
}

export function ensureLogStream(projectId: string) {
	if (logProcesses.has(projectId)) return; // Already streaming
	
	const project = getProjectById(projectId);
	if (!project || project.type !== "docker" || project.status === "stopped" || project.status === "error") return;

	const parts = project.command.split(" ");
	const lastPart = parts[parts.length - 1];
	let serviceName = "";
	if (lastPart && !lastPart.startsWith("-") && lastPart !== "up") {
		serviceName = lastPart;
	}

	const logCmd = ["docker", "compose", "logs", "-f", "--tail=100"];
	if (serviceName) logCmd.push(serviceName);

	const logProc = Bun.spawn(logCmd, {
		cwd: project.path,
		stdout: "pipe",
		stderr: "pipe",
		onExit: () => {
			logProcesses.delete(projectId);
		}
	});
	
	logProcesses.set(projectId, logProc);
	
	const readLogStream = async (stream: ReadableStream) => {
		const reader = stream.getReader();
		const decoder = new TextDecoder();
		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				const text = decoder.decode(value);
				broadcastLog(projectId, text.replace(/\n/g, "\r\n"));
			}
		} catch (e) {}
	};
	
	if (logProc.stdout) readLogStream(logProc.stdout);
	if (logProc.stderr) readLogStream(logProc.stderr);
}

export function startProjectGroup(groupPath: string) {
	const allProjects = getProjects();
	const groupProjects = allProjects.filter(p => p.path === groupPath && p.type === "docker");
	if (groupProjects.length === 0) return;

	for (const p of groupProjects) {
		p.status = "starting";
		updateProject(p);
	}

	const cmd = ["docker", "compose", "up", "-d"];
	const proc = Bun.spawn(cmd, {
		cwd: groupPath,
		stdout: "pipe",
		stderr: "pipe",
		onExit: (_proc, exitCode) => {
			for (const p of groupProjects) {
				const currentP = getProjectById(p.id);
				if (currentP) {
					if (exitCode === 0) {
						ensureLogStream(p.id);
						if (currentP.healthcheck?.type === "none") {
							currentP.status = "running";
							updateProject(currentP);
						}
					} else {
						currentP.status = "error";
						updateProject(currentP);
					}
				}
			}
		}
	});
	processes.set(groupPath, proc);

	// To avoid blocking, we won't stream the output of this global command to every individual project,
	// but we could stream it to the first project or all of them.
	// For simplicity, when `up -d` finishes, `ensureLogStream` will fetch logs for each service.
}

export function stopProjectGroup(groupPath: string) {
	const allProjects = getProjects();
	const groupProjects = allProjects.filter(p => p.path === groupPath && p.type === "docker");
	if (groupProjects.length === 0) return;

	console.log(`[Engine] Stopping project group: ${groupPath}`);
	const procGroup = processes.get(groupPath);
	if (procGroup) {
		procGroup.kill();
		processes.delete(groupPath);
	}

	Bun.spawn(["docker", "compose", "stop"], {
		cwd: groupPath,
	});

	for (const p of groupProjects) {
		const proc = processes.get(p.id);
		if (proc) {
			proc.kill();
			processes.delete(p.id);
		}
		const logProc = logProcesses.get(p.id);
		if (logProc) {
			logProc.kill();
			logProcesses.delete(p.id);
		}

		p.status = "stopped";
		updateProject(p);
	}
}
