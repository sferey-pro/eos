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
				return "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
			case "running":
				return "text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
			case "starting":
				return "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 animate-pulse";
			case "error":
				return "text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
			default:
				return "text-zinc-500 border-zinc-500/30 bg-zinc-500/10";
		}
	};

	return (
		<div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/50 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.1),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] transition-colors duration-500">
			{/* HEADER */}
			<header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
				<div className="w-full px-6 h-16 flex items-center justify-between">
					{/* Logo & Title */}
					<div className="flex items-center gap-3 group cursor-pointer">
						<div className="relative">
							<div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 opacity-0 group-hover:opacity-40 blur transition-opacity duration-500" />
							<img
								src="/eos-logo.jpg"
								alt="EOS Logo"
								className="relative w-8 h-8 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
							/>
						</div>
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
						<Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 active:scale-95 group">
							<Play className="w-4 h-4 mr-2 group-hover:animate-pulse" />
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
					{projects.map((project, index) => (
						<Card
							key={project.id}
							style={{
								animationDelay: `${index * 50}ms`,
								animationFillMode: "both",
							}}
							className={`group relative overflow-hidden bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300/80 dark:hover:border-zinc-700/80 hover:shadow-xl dark:hover:shadow-zinc-900/50 hover:-translate-y-1 transition-all duration-300 ease-out animate-in fade-in zoom-in-95 slide-in-from-bottom-4 ${project.status === "stopped" ? "opacity-70 grayscale-[20%]" : ""}`}
						>
							<CardHeader className="pb-3 flex flex-row items-center justify-between">
								<CardTitle className="text-lg font-medium">
									{project.name}
								</CardTitle>
								<Badge
									variant="outline"
									className={`${getStatusColor(project.status)} transition-colors duration-300`}
								>
									{project.status.charAt(0).toUpperCase() +
										project.status.slice(1)}
								</Badge>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
									{project.path}
								</p>
								<p
									className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 font-mono line-clamp-1 bg-zinc-100/50 dark:bg-zinc-950/50 p-1.5 rounded-md"
									title={project.command}
								>
									{project.command}
								</p>
							</CardContent>
							<CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between bg-zinc-50/30 dark:bg-zinc-900/30">
								<div className="flex gap-1">
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 hover:scale-110 active:scale-95 transition-all duration-200"
										disabled={
											project.status !== "stopped" && project.status !== "error"
										}
									>
										<Play className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 hover:scale-110 active:scale-95 transition-all duration-200"
										disabled={project.status === "stopped"}
									>
										<RefreshCw className="h-4 w-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 hover:scale-110 active:scale-95 transition-all duration-200"
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
											className="text-zinc-500 h-8 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
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
						<div className="col-span-full py-24 text-center flex flex-col items-center justify-center border-2 border-dashed border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
							<div className="w-16 h-16 mb-4 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm border border-zinc-100 dark:border-zinc-800">
								<Square className="w-8 h-8 text-zinc-400" />
							</div>
							<h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">
								Aucun projet
							</h3>
							<p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
								Commencez par ajouter un projet depuis votre environnement de
								développement local.
							</p>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
