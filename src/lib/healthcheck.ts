import { getProjects, updateProject } from "./db";
import { getGitStatus, type GitStatus } from "./git";

export const gitStatusCache = new Map<string, GitStatus>();
let gitLoopInterval: ReturnType<typeof setInterval> | null = null;

let loopInterval: ReturnType<typeof setInterval> | null = null;

export function startHealthcheckEngine() {
	if (loopInterval) return;

	// Git Status Loop (every 15 seconds)
	gitLoopInterval = setInterval(async () => {
		const projects = getProjects();
		for (const p of projects) {
			const status = await getGitStatus(p.path);
			gitStatusCache.set(p.id, status);
		}
	}, 15000);
	// Initial run
	setTimeout(async () => {
		const projects = getProjects();
		for (const p of projects) {
			const status = await getGitStatus(p.path);
			gitStatusCache.set(p.id, status);
		}
	}, 1000);

	// Loop every 5 seconds
	loopInterval = setInterval(async () => {
		const projects = getProjects();
		
		for (const project of projects) {
			// Only check projects that are supposed to be active
			if (project.status === "stopped" || project.status === "error") continue;
			
			const hc = project.healthcheck;
			if (!hc || hc.type === "none" || !hc.target) continue;

			try {
				const isHealthy = await ping(hc.type, hc.target);
				
				if (isHealthy && project.status === "starting") {
					console.log(`[Healthcheck] Project ${project.name} is now RUNNING`);
					project.status = "running";
					updateProject(project);
				} else if (!isHealthy && project.status === "running") {
					console.log(`[Healthcheck] Project ${project.name} is failing... Marking as ERROR`);
					project.status = "error";
					updateProject(project);
				}
			} catch (error) {
				if (project.status === "running") {
					console.log(`[Healthcheck] Project ${project.name} is failing... Marking as ERROR`);
					project.status = "error";
					updateProject(project);
				}
			}
		}
	}, 5000);
}

async function ping(type: "http" | "tcp", target: string): Promise<boolean> {
	if (type === "http") {
		// target could be "http://localhost:3000" or just "3000" (default to localhost)
		let url = target;
		if (!url.startsWith("http")) {
			// If it's just a port or localhost:port
			if (/^\d+$/.test(url)) url = `http://localhost:${url}`;
			else url = `http://${url}`;
		}
		
		try {
			const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(2000) });
			return res.ok || res.status < 500;
		} catch {
			return false;
		}
	} else if (type === "tcp") {
		// target should be "port" or "host:port"
		let host = "127.0.0.1";
		let port = 0;
		
		if (target.includes(":")) {
			const parts = target.split(":");
			host = parts[0] || "127.0.0.1";
			port = parseInt(parts[1] || "0", 10);
		} else {
			port = parseInt(target, 10);
		}

		if (isNaN(port)) return false;

		try {
			const socket = await Bun.connect({
				hostname: host,
				port: port,
				socket: {
					data() {},
					open(sock) {
						sock.end();
					},
					error() {},
					close() {},
				},
			});
			return true;
		} catch {
			return false;
		}
	}
	return false;
}
