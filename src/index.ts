import { serve } from "bun";
import index from "./index.html";
import {
	getProjects,
	insertProject,
	getApps,
	insertApp,
	getPresets,
	insertPreset,
	updatePreset,
	deletePreset,
	clearAllData,
} from "./lib/db";
import { scanDirectory } from "./lib/scanner";
import { startHealthcheckEngine, gitStatusCache } from "./lib/healthcheck";
import { ProjectSchema, AppSchema, PresetSchema } from "./lib/schemas";
import {
	startProject,
	stopProject,
	startApp,
	stopApp,
	getProjectLogs,
} from "./lib/engine";

startHealthcheckEngine();

const server = serve({
	port: process.env.PORT || 5173,
	routes: {
		"/eos-logo.jpg": Bun.file("./public/eos-logo.jpg"),
		// Serve index.html for all unmatched routes.
		"/*": index,

		"/api/scan": {
			async POST(req) {
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

		"/api/projects": {
			async GET() {

				const projects = getProjects().map(p => ({
					...p,
					gitStatus: gitStatusCache.get(p.id) || null
				}));
				return Response.json({ projects });
			},
			async POST(req) {
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
			async POST(req) {
				try {
					const body = await req.json();
					const app = AppSchema.parse(body);
					insertApp(app);
					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 400 });
				}
			},
		},

		"/api/presets": {
			async GET() {
				const presets = getPresets();
				return Response.json({ presets });
			},
			async POST(req) {
				try {
					const body = await req.json();
					const preset = PresetSchema.parse(body);
					insertPreset(preset);
					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 400 });
				}
			},
			async PUT(req) {
				try {
					const body = await req.json();
					if (!body.id) return new Response("Missing id", { status: 400 });
					updatePreset(body.id, body);
					return Response.json({ success: true });
				} catch (e) {
					return new Response(String(e), { status: 400 });
				}
			},
			async DELETE(req) {
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
			async POST(req) {
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

		"/api/action": {
			async POST(req) {
				try {
					const { id, action, type = "project" } = await req.json();

					if (type === "app") {
						if (action === "start") startApp(id);
						else if (action === "stop") stopApp(id);
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
			async GET(req) {
				const url = new URL(req.url);
				const id = url.searchParams.get("id");
				if (!id) return new Response("Missing id", { status: 400 });

				const logs = getProjectLogs(id);
				return Response.json({ logs });
			},
		},
	},

	development: process.env.NODE_ENV !== "production" && {
		hmr: true,
		console: true,
	},
});

console.log(`🚀 Server running at ${server.url}`);
