import { serve } from "bun";
import index from "./index.html";
import { getProjects, insertProject } from "./lib/db";
import { scanDirectory } from "./lib/scanner";
import { ProjectSchema } from "./lib/schemas";

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
				if (process.env.DEMO_MODE === "true") {
					return Response.json({
						projects: [
							{
								id: "demo-1",
								name: "api-gateway",
								path: "./services/api-gateway",
								type: "docker",
								command: "docker compose up -d api",
								status: "healthy",
								dependsOn: [],
								healthcheck: { type: "tcp", target: "3000" },
							},
							{
								id: "demo-2",
								name: "postgres-db",
								path: "./docker/infra",
								type: "make",
								command: "make start-db",
								status: "starting",
								dependsOn: [],
								healthcheck: { type: "tcp", target: "5432" },
							},
							{
								id: "demo-3",
								name: "worker-queue",
								path: "./services/worker",
								type: "bun",
								command: "bun run start",
								status: "stopped",
								dependsOn: ["demo-1", "demo-2"],
								healthcheck: { type: "none" },
							},
						],
					});
				}
				const projects = getProjects();
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
	},

	development: process.env.NODE_ENV !== "production" && {
		hmr: true,
		console: true,
	},
});

console.log(`🚀 Server running at ${server.url}`);
