import { Play, RefreshCw, Square, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import { AddProjectModal } from "@/components/AddProjectModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import type { Project } from "@/lib/schemas";

export function HomePage() {
	const [projects, setProjects] = useState<Project[]>([]);

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				const res = await fetch("/api/projects");
				const data = await res.json();
				setProjects(data.projects || []);
			} catch (e) {
				console.error(e);
			}
		};

		fetchProjects();
		const interval = setInterval(fetchProjects, 2000);
		return () => clearInterval(interval);
	}, []);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "healthy":
				return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
			case "running":
				return "text-blue-500 border-blue-500/30 bg-blue-500/10";
			case "starting":
				return "text-amber-500 border-amber-500/30 bg-amber-500/10";
			case "error":
				return "text-rose-500 border-rose-500/30 bg-rose-500/10";
			default:
				return "text-zinc-500 border-zinc-500/30 bg-zinc-500/10";
		}
	};

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
			{/* HEADER */}
			<header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
				<div className="w-full px-6 h-16 flex items-center justify-between">
					{/* Logo & Title */}
					<div className="flex items-center gap-3">
						<img
							src="/eos-logo.jpg"
							alt="EOS Logo"
							className="w-8 h-8 rounded-full object-cover shadow-sm"
						/>
						<h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
							EOS
						</h1>
					</div>

					{/* Center: Presets */}
					<div className="hidden md:flex items-center gap-2">
						<Select defaultValue="all">
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Choisir un preset..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tout lancer (Défaut)</SelectItem>
								<SelectItem value="backend">Backend Uniquement</SelectItem>
								<SelectItem value="frontend">Frontend + Storybook</SelectItem>
							</SelectContent>
						</Select>
						<Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg transition-all hover:scale-105">
							<Play className="w-4 h-4 mr-2" />
							Aurore
						</Button>
					</div>

					{/* Right: Actions */}
					<div className="flex items-center gap-2">
						<AddProjectModal />
						<ThemeToggle />
					</div>
				</div>
			</header>

			{/* MAIN CONTENT */}
			<main className="w-full px-6 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
					{projects.map((project) => (
						<Card
							key={project.id}
							className={`bg-white/50 dark:bg-zinc-900/50 backdrop-blur border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all ${project.status === "stopped" ? "opacity-70" : ""}`}
						>
							<CardHeader className="pb-3 flex flex-row items-center justify-between">
								<CardTitle className="text-lg font-medium">
									{project.name}
								</CardTitle>
								<Badge
									variant="outline"
									className={getStatusColor(project.status)}
								>
									{project.status.charAt(0).toUpperCase() +
										project.status.slice(1)}
								</Badge>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-zinc-500 dark:text-zinc-400">
									{project.path}
								</p>
								<p
									className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-mono line-clamp-1"
									title={project.command}
								>
									{project.command}
								</p>
							</CardContent>
							<CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
								<div className="flex gap-1">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-zinc-400 hover:text-emerald-500"
										disabled={
											project.status !== "stopped" && project.status !== "error"
										}
									>
										<Play className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-zinc-400 hover:text-amber-500"
										disabled={project.status === "stopped"}
									>
										<RefreshCw className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-zinc-400 hover:text-rose-500"
										disabled={project.status === "stopped"}
									>
										<Square className="h-4 w-4" />
									</Button>
								</div>

								<Sheet>
									<SheetTrigger asChild>
										<Button
											variant="ghost"
											size="sm"
											className="text-zinc-500 h-8"
											disabled={project.status === "stopped"}
										>
											<Terminal className="h-4 w-4 mr-2" />
											Logs
										</Button>
									</SheetTrigger>
									<SheetContent
										side="bottom"
										className="h-[40vh] sm:h-[50vh] bg-black text-zinc-100 border-t border-zinc-800"
									>
										<SheetHeader>
											<SheetTitle className="text-zinc-300 font-mono text-sm flex items-center">
												<Terminal className="w-4 h-4 mr-2" />
												Logs: {project.name}
											</SheetTitle>
										</SheetHeader>
										<ScrollArea className="h-full mt-4 rounded-md border border-zinc-800 bg-zinc-950 p-4">
											<pre className="text-xs font-mono text-zinc-400 leading-relaxed">
												{/* Simulation de logs pour le moment */}
												[INFO] Starting {project.name}...{"\n"}
												{project.status === "healthy" && (
													<span className="text-emerald-400">
														[OK] Healthcheck passed.
													</span>
												)}
												{project.status === "error" && (
													<span className="text-rose-400">
														[ERROR] Process exited with code 1.
													</span>
												)}
											</pre>
										</ScrollArea>
									</SheetContent>
								</Sheet>
							</CardFooter>
						</Card>
					))}

					{projects.length === 0 && (
						<div className="col-span-full py-20 text-center flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/20">
							<p className="text-zinc-500 dark:text-zinc-400 mb-4">
								Aucun projet configuré dans cet environnement.
							</p>
							{/* Le bouton d'ajout sera dans le header, mais on pourrait le rappeler ici */}
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
