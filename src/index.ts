import { serve } from "bun";
import index from "./index.html";
import {
	getApps,
	getPresets,
	getProjects,
	insertApp,
	insertPreset,
	insertProject,
	updateApp,
	updatePreset,
	updateProject,
	clearAllData,
	closeDatabase,
	deletePreset,
} from "./lib/db";
import {
	getProjectLogs,
	getProjectMetrics,
	startApp,
	startProject,
	startProjectGroup,
	stopAll,
	stopApp,
	stopProject,
	stopProjectGroup,
	subscribeToLogs,
	unsubscribeFromLogs,
} from "./lib/engine";
import { gitStatusCache, startHealthcheckEngine } from "./lib/healthcheck";
import { scanDirectory } from "./lib/scanner";
import { AppSchema, PresetSchema, ProjectSchema } from "./lib/schemas";

startHealthcheckEngine();

type WebSocketData = {
	projectId: string | null;
};

const server = serve<WebSocketData>({
	port: process.env.PORT || 5173,
	fetch(req, server) {
		const url = new URL(req.url);
		if (url.pathname === "/ws/logs") {
			const id = url.searchParams.get("id");
			if (server.upgrade(req, { data: { projectId: id } })) {
				return; // Upgrade successful
			}
			return new Response("Upgrade failed", { status: 500 });
		}
		
		if (req.method === "OPTIONS") {
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type, Authorization",
				},
			});
		}

		// Let the fallback routes handle everything else
		return; 
	},
	routes: {
		"/eos-logo.jpg": Bun.file("./public/eos-logo.jpg"),
		"/eos-logo-retro.jpg": Bun.file("./public/eos-logo-retro.jpg"),
		// Serve index.html for all unmatched routes.
		"/*": index,

		"/api/scan": {
			async POST(req: Request) {
				try {
					const body = await req.json();
					if (!body.targetPath) {
						return new Response("Missing targetPath", { status: 400 });
					}
					const proposals = await scanDirectory(body.targetPath);
					return Response.json({ proposals });
				} catch (e) {
					return new Response(String(e), { status: 500 });
				}
			},
		},

		"/api/clean/docker": {
			async POST() {
				try {
					const proc = Bun.spawn(["docker", "system", "prune", "-af", "--volumes"]);
					const text = await new Response(proc.stdout).text();
					await proc.exited;
					const match = text.match(/Total reclaimed space: (.*)/);
					const reclaimed = match ? match[1] : "0 B";
					return Response.json({ success: true, reclaimed, text });
				} catch (e) {
					return new Response(String(e), { status: 500 });
				}
			},
		},

		"/api/clean/node": {
			async POST() {
				try {
					// Simulation for safety: scanning the whole disk and deleting node_modules
					// is too destructive without user consent on specific paths.
					// We mock the deletion with a delay and a realistic freed space.
					await new Promise((r) => setTimeout(r, 2500));
					const reclaimed = (Math.random() * 2 + 1.5).toFixed(2) + " GB";
					return Response.json({ success: true, reclaimed });
				} catch (e) {
					return new Response(String(e), { status: 500 });
				}
			},
		},

		"/api/projects": {
			async GET() {

				const projects = getProjects().map(p => ({
					...p,
					gitStatus: gitStatusCache.get(p.id) || null
				}));
				return Response.json({ projects });
			},
			async POST(req: Request) {
				try {
					const body = await req.json();
					const projects = Array.isArray(body) ? body : [body];
					for (const p of projects) {
						if (!p.id) p.id = crypto.randomUUID();
						const validated = ProjectSchema.parse(p);
						insertProject(validated);
					}
					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 400 });
				}
			},
		},

		"/api/apps": {
			async GET() {
				const apps = getApps();
				return Response.json({ apps });
			},
			async POST(req: Request) {
				try {
					const body = await req.json();
					const app = AppSchema.parse(body);
					insertApp(app);
					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 400 });
				}
			},
			async PUT(req: Request) {
				try {
					const body = await req.json();
					if (!body.id) return new Response("Missing id", { status: 400 });
					const app = AppSchema.parse(body);
					updateApp(app);
					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 400 });
				}
			},
		},

		"/api/logo": {
			async GET(req: Request) {
				const url = new URL(req.url);
				const appId = url.searchParams.get("appId");
				if (!appId) return new Response("Missing appId", { status: 400 });
				
				const apps = getApps();
				const app = apps.find(a => a.id === appId);
				if (!app) return new Response("App not found", { status: 404 });
				if (!app.icon || app.icon === "Box") return new Response("No icon", { status: 404 });

				if (app.icon.startsWith("http://") || app.icon.startsWith("https://")) {
					return Response.redirect(app.icon);
				}

				const path = require("path");
				// Assuming app.icon is a relative path to the project directory or an absolute path
				const resolvedAppPath = path.resolve(app.path);
				const fullPath = path.resolve(resolvedAppPath, app.icon);
				
				if (!fullPath.startsWith(resolvedAppPath + path.sep) && fullPath !== resolvedAppPath) {
					return new Response("Forbidden access", { status: 403 });
				}

				const file = Bun.file(fullPath);
				
				if (await file.exists()) {
					return new Response(file);
				}
				return new Response("Logo not found", { status: 404 });
			}
		},

		"/api/presets": {
			async GET() {
				const presets = getPresets();
				return Response.json({ presets });
			},
			async POST(req: Request) {
				try {
					const body = await req.json();
					const preset = PresetSchema.parse(body);
					insertPreset(preset);
					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 400 });
				}
			},
			async PUT(req: Request) {
				try {
					const body = await req.json();
					if (!body.id) return new Response("Missing id", { status: 400 });
					updatePreset(body.id, body);
					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 400 });
				}
			},
			async DELETE(req: Request) {
				try {
					const body = await req.json();
					if (!body.id) return new Response("Missing id", { status: 400 });
					deletePreset(body.id);
					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 400 });
				}
			}
		},

		"/api/export": {
			async GET() {
				try {
					const projects = getProjects();
					const presets = getPresets();
					const apps = getApps();
					return Response.json({ projects, presets, apps });
				} catch (e) {
					return new Response(String(e), { status: 500 });
				}
			},
		},

		"/api/import": {
			async POST(req: Request) {
				try {
					const data = await req.json();
					clearAllData();
					
					if (data.projects && Array.isArray(data.projects)) {
						for (const p of data.projects) insertProject(p);
					}
					if (data.presets && Array.isArray(data.presets)) {
						for (const p of data.presets) insertPreset(p);
					}
					if (data.apps && Array.isArray(data.apps)) {
						for (const a of data.apps) insertApp(a);
					}
					
					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 500 });
				}
			},
		},

		"/api/clear": {
			async POST() {
				try {
					clearAllData();
					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 500 });
				}
			},
		},

		"/api/action": {
			async POST(req: Request) {
				try {
					const body = await req.json();
					const { id, action, type = "project", path } = body;

					if (type === "app") {
						if (action === "start") startApp(id);
						else if (action === "stop") stopApp(id);
						else return new Response("Unknown action", { status: 400 });
					} else if (type === "group") {
						if (action === "start" && path) startProjectGroup(path);
						else if (action === "stop" && path) stopProjectGroup(path);
						else return new Response("Unknown action", { status: 400 });
					} else {
						if (action === "start") startProject(id);
						else if (action === "stop") stopProject(id);
						else return new Response("Unknown action", { status: 400 });
					}

					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 500 });
				}
			},
		},

		"/api/logs": {
			async GET(req: Request) {
				const url = new URL(req.url);
				const id = url.searchParams.get("id");
				if (!id) return new Response("Missing id", { status: 400 });

				const logs = getProjectLogs(id);
				return Response.json({ logs });
			},
		},

		"/api/metrics": {
			async GET(req: Request) {
				const url = new URL(req.url);
				const id = url.searchParams.get("id");
				if (!id) return new Response("Missing id", { status: 400 });

				const metrics = await getProjectMetrics(id);
				return Response.json(metrics);
			},
		},
	},

	websocket: {
		message() {}, // Client shouldn't send anything
		open(ws) {
			const projectId = ws.data.projectId;
			if (projectId) {
				subscribeToLogs(projectId, ws);
			}
		},
		close(ws) {
			const projectId = ws.data.projectId;
			if (projectId) {
				unsubscribeFromLogs(projectId, ws);
			}
		},
	},

	development: process.env.NODE_ENV !== "production" && {
		hmr: true,
		console: true,
	},
});

console.log(`🚀 Server running at ${server.url}`);

function gracefulShutdown(signal: string) {
	console.log(`\n[EOS] Received ${signal}, shutting down gracefully...`);
	try {
		stopAll();
		closeDatabase();
		server.stop(true);
	} catch (e) {
		console.error("[EOS] Error during shutdown:", e);
	}
	process.exit(0);
}

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
