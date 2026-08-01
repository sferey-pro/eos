import { Play, RefreshCw, Square, Terminal, ExternalLink, Box, Grid2x2, Plus, PanelLeft, Server, Settings, GitBranch, ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";
import { AddProjectModal } from "@/components/AddProjectModal";
import { AddAppModal } from "@/components/AddAppModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Project, App, Preset } from "@/lib/schemas";
import { useNavigate } from "react-router-dom";

export function HomePage() {
	const navigate = useNavigate();
	const [projects, setProjects] = useState<Project[]>([]);
	const [apps, setApps] = useState<App[]>([]);
	const [presets, setPresets] = useState<Preset[]>([]);
	const [selectedPresetId, setSelectedPresetId] = useState<string>("all");
	const [isLogsOpen, setIsLogsOpen] = useState(false);
	const [activeLogId, setActiveLogId] = useState<string | null>(null);
	const [activeLogs, setActiveLogs] = useState<string>("");



	useEffect(() => {
		if (!isLogsOpen || !activeLogId) return;
		const fetchLogs = async () => {
			try {
				const res = await fetch(`/api/logs?id=${activeLogId}`);
				if (res.ok) {
					const data = await res.json();
					setActiveLogs(data.logs || "");
				}
			} catch (e) {
				console.error(e);
			}
		};
		fetchLogs();
		const interval = setInterval(fetchLogs, 1000);
		return () => clearInterval(interval);
	}, [isLogsOpen, activeLogId]);

	const handleAction = async (id: string, action: "start" | "stop") => {
		try {
			await fetch("/api/action", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, action }),
			});
		} catch (e) {
			console.error("Action failed:", e);
		}
	};

	const fetchData = async () => {
		try {
			const [resProjects, resApps, resPresets] = await Promise.all([
				fetch("/api/projects"),
				fetch("/api/apps"),
				fetch("/api/presets"),
			]);
			if (resProjects.ok) {
				const data = await resProjects.json();
				setProjects(data.projects || []);
			}
			if (resApps.ok) {
				const data = await resApps.json();
				setApps(data.apps || []);
			}
			if (resPresets.ok) {
				const data = await resPresets.json();
				setPresets(data.presets || []);
			}
		} catch (error) {
			console.error("Failed to fetch data:", error);
		}
	};

	useEffect(() => {
		fetchData();
		const interval = setInterval(() => {
			fetchData();
		}, 2000);
		return () => clearInterval(interval);
	}, []);

	const handleAppAction = async (id: string, action: "start" | "stop") => {
		try {
			await fetch("/api/action", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, action, type: "app" }),
			});
		} catch (e) {
			console.error("Action failed:", e);
		}
	};

	// Ouvrir automatiquement si une erreur survient (Optionnel)
	useEffect(() => {
		const errorProject = projects.find((p) => p.status === "error");
		if (errorProject && !isLogsOpen) {
			setActiveLogId(errorProject.id);
			setIsLogsOpen(true);
		}
	}, [projects, isLogsOpen]);

	const getStatusColor = (status: string) => {
		switch (status) {
			case "healthy":
				return "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_10px_rgba(10,185,129,0.2)]";
			case "running":
				return "text-blue-600 dark:text-blue-400 border-blue-500/30 bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]";
			case "starting":
				return "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10 animate-pulse";
			case "error":
				return "text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/10 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
			case "waiting":
				return "text-purple-600 dark:text-purple-400 border-purple-500/30 bg-purple-500/10 animate-pulse";
			default:
				return "text-zinc-500 border-zinc-500/30 bg-zinc-500/10";
		}
	};

	const activeProjects = projects.filter((p) => p.status !== "stopped");
	const totalProjects = projects.length;
	const healthyProjects = projects.filter(
		(p) => p.status === "healthy" || p.status === "running",
	).length;
	const errorProjects = projects.filter((p) => p.status === "error").length;

	return (
		<div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 retro:bg-background transition-all duration-500 pb-20 overflow-hidden w-full">
			{/* RETRO OVERLAYS */}
			<div className="hidden retro:block fixed inset-0 z-[9999] pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)_2px,transparent_2px,transparent_4px)] opacity-50 mix-blend-overlay"></div>
			<div className="hidden retro:block fixed inset-0 z-[9998] pointer-events-none shadow-[inset_0_0_200px_rgba(255,0,255,0.15)]"></div>
			{/* BLOOD DRAGON 3D GRID */}
			<div className="hidden retro:block absolute inset-0 z-0 pointer-events-none [perspective:1000px] overflow-hidden">
				<div className="absolute bottom-0 w-[200%] h-[120%] -left-[50%] bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:60px_60px] [transform:rotateX(75deg)_translateY(200px)_translateZ(-200px)] opacity-30 shadow-[0_0_20px_var(--color-primary)] [mask-image:linear-gradient(to_bottom,transparent,black_40%)]"></div>
			</div>
			{/* BACKGROUND PATTERN */}
			<div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] retro:hidden"></div>
			<div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.25),rgba(255,255,255,0))] retro:hidden"></div>

			<div className="relative z-10 flex flex-col h-full">
				{/* HEADER */}
				<header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 retro:border-primary/30 bg-white/70 dark:bg-zinc-950/70 retro:bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 retro:supports-[backdrop-filter]:bg-background/90">
					<div className="w-full px-6 h-16 flex items-center justify-between">
						{/* Logo & Title */}
						<div className="flex items-center gap-4">
							<SidebarTrigger className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 retro:text-cyan-400" />
							<div className="flex items-center gap-3 group cursor-pointer">
								<div className="relative">
									<div className="absolute -inset-1 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 opacity-0 group-hover:opacity-40 blur transition-opacity duration-500" />
									<img
										src="/eos-logo.jpg"
										alt="EOS Logo"
										className="relative w-9 h-9 rounded-full object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
									/>
								</div>
								<div className="flex flex-col">
									<h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-400 retro:from-[#ff00ff] retro:to-[#00ffff] tracking-tight retro:drop-shadow-[0_0_8px_rgba(255,0,255,0.8)] retro:italic">
										EOS
									</h1>
									<span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider -mt-1 retro:text-[#00ffff] retro:drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]">
										Environment Operating System
									</span>
								</div>
							</div>
						</div>

						{/* Center: Presets */}
						<div className="hidden md:flex items-center gap-2">
							<div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-md p-1 retro:bg-black/60 retro:border retro:border-fuchsia-500/50 retro:shadow-[0_0_10px_rgba(217,70,239,0.3)]">
								<Select value={selectedPresetId} onValueChange={setSelectedPresetId}>
									<SelectTrigger className="w-[280px] border-none bg-transparent shadow-none h-8 focus:ring-0 retro:text-cyan-400 retro:font-mono retro:uppercase retro:tracking-wider">
										<SelectValue placeholder="Choisir un preset..." />
									</SelectTrigger>
									<SelectContent className="retro:bg-black/95 retro:border-fuchsia-500/50 retro:shadow-[0_0_15px_rgba(217,70,239,0.5)] retro:backdrop-blur-md">
										<SelectItem value="all" className="retro:text-cyan-400 retro:focus:bg-fuchsia-500/20 retro:focus:text-cyan-300 retro:font-mono retro:uppercase retro:tracking-wider cursor-pointer">Tout lancer (Défaut)</SelectItem>
										{presets.map(p => (
											<SelectItem key={p.id} value={p.id} className="retro:text-cyan-400 retro:focus:bg-fuchsia-500/20 retro:focus:text-cyan-300 retro:font-mono retro:uppercase retro:tracking-wider cursor-pointer">{p.name}</SelectItem>
										))}
									</SelectContent>
								</Select>
								<div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-1 retro:bg-fuchsia-500/50 retro:shadow-[0_0_5px_rgba(217,70,239,0.8)]"></div>
								<Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 retro:text-cyan-400 retro:hover:bg-cyan-500/20" title="Configuration">
									<Settings className="w-4 h-4" />
								</Button>
							</div>
							<Button
								className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-105 active:scale-95 group retro:bg-none retro:bg-transparent retro:border-2 retro:border-[#00ffff] retro:text-[#00ffff] retro:hover:bg-[#00ffff]/20 retro:shadow-[0_0_15px_#00ffff,inset_0_0_10px_#00ffff] retro:uppercase retro:tracking-widest retro:italic retro:font-bold"
								title="Démarrer l'environnement"
								onClick={() => {
									let targetProjectIds = projects.map(p => p.id);
									if (selectedPresetId !== "all") {
										const preset = presets.find(p => p.id === selectedPresetId);
										if (preset) targetProjectIds = preset.projectIds;
									}
									targetProjectIds.forEach((id) => {
										handleAction(id, "start");
									});
								}}
							>
								<Play className="w-4 h-4 mr-2 group-hover:animate-pulse" />
								Aurore
							</Button>
						</div>

						{/* Right: Actions */}
						<div className="flex items-center gap-2">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="ghost"
										size="icon"
										className="relative hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
									>
										<Grid2x2 className="w-5 h-5" />
										{apps.length > 0 && (
											<span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 border border-white dark:border-zinc-950"></span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent
									align="end"
									className="w-[340px] p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl rounded-2xl"
								>
									<div className="flex items-center gap-2 mb-4 px-1">
										<Box className="w-5 h-5 text-indigo-500" />
										<h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
											Lanceur d'Applications
										</h3>
									</div>
									<div className="grid grid-cols-3 gap-3">
										{apps.map((app) => (
											<div key={app.id} className="relative group">
												<button
													onClick={() =>
														app.status === "running" || app.status === "healthy"
															? window.open(app.url, "_blank")
															: handleAppAction(app.id, "start")
													}
													className={`w-full flex flex-col items-center justify-center p-3 rounded-xl border ${app.status === "running" || app.status === "healthy" ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "bg-white dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-800"} transition-all cursor-pointer`}
												>
													<div
														className={`w-10 h-10 mb-2 flex items-center justify-center rounded-lg ${app.status === "running" || app.status === "healthy" ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"}`}
													>
														<Box className="w-5 h-5" />
													</div>
													<span className="text-xs font-medium text-center truncate w-full text-zinc-700 dark:text-zinc-300">
														{app.name}
													</span>
													{(app.status === "running" ||
														app.status === "healthy") && (
														<div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse" />
													)}
												</button>
												{(app.status === "running" ||
													app.status === "healthy") && (
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleAppAction(app.id, "stop");
														}}
														className="absolute -top-2 -left-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full p-1 opacity-0 group-hover:opacity-100 shadow-sm transition-opacity hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 z-10"
													>
														<Square className="w-3 h-3 fill-current" />
													</button>
												)}
											</div>
										))}
										<AddAppModal>
											<button className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group h-full">
												<div className="w-10 h-10 mb-2 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50">
													<Plus className="w-5 h-5 text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
												</div>
												<span className="text-xs font-medium text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
													Ajouter
												</span>
											</button>
										</AddAppModal>
									</div>
								</PopoverContent>
							</Popover>
							<AddProjectModal />
							<ThemeToggle />
						</div>
					</div>
				</header>

				{/* MAIN CONTENT */}
				<main className="w-full max-w-screen-2xl mx-auto px-6 py-8 flex flex-col gap-12">
					{/* KPI DASHBOARD */}
					{projects.length > 0 && (
						<div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
							<h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 retro:text-cyan-400 retro:font-mono retro:uppercase retro:tracking-widest retro:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
								<Server className="w-5 h-5 text-zinc-500 retro:text-cyan-400" />
								Infrastructure / Projets
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<Card className="bg-white/40 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-zinc-800/50 backdrop-blur-xl shadow-sm retro:bg-black/60 retro:border-fuchsia-500/50 retro:shadow-[0_0_15px_rgba(217,70,239,0.2)]">
									<CardContent className="p-6 flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 retro:text-fuchsia-400 retro:font-mono retro:uppercase tracking-widest">
												Total Services
											</p>
											<h3 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 retro:text-fuchsia-300 retro:drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]">
												{totalProjects}
											</h3>
										</div>
										<div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center border border-zinc-200 dark:border-zinc-700 retro:bg-fuchsia-500/10 retro:border-fuchsia-500/50 retro:shadow-[inset_0_0_10px_rgba(217,70,239,0.3)]">
											<Square className="w-5 h-5 text-zinc-500 dark:text-zinc-400 retro:text-fuchsia-400" />
										</div>
									</CardContent>
								</Card>
								<Card className="bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/20 backdrop-blur-xl shadow-sm retro:bg-black/60 retro:border-cyan-400/50 retro:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
									<CardContent className="p-6 flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 retro:text-cyan-400 retro:font-mono retro:uppercase tracking-widest">
												Services Actifs
											</p>
											<h3 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 retro:text-cyan-300 retro:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
												{healthyProjects}
											</h3>
										</div>
										<div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/50 retro:bg-cyan-500/10 retro:border-cyan-400/50 retro:shadow-[inset_0_0_10px_rgba(34,211,238,0.3)]">
											<Play className="w-5 h-5 text-emerald-600 dark:text-emerald-400 retro:text-cyan-400" />
										</div>
									</CardContent>
								</Card>
								<Card className="bg-rose-50/40 dark:bg-rose-950/20 border-rose-500/20 backdrop-blur-xl shadow-sm retro:bg-black/60 retro:border-rose-500/50 retro:shadow-[0_0_15px_rgba(244,63,94,0.2)]">
									<CardContent className="p-6 flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-rose-600 dark:text-rose-400 retro:text-rose-400 retro:font-mono retro:uppercase tracking-widest">
												En Erreur
											</p>
											<h3 className="text-3xl font-bold text-rose-700 dark:text-rose-300 retro:text-rose-300 retro:drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">
												{errorProjects}
											</h3>
										</div>
										<div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center border border-rose-200 dark:border-rose-800/50 retro:bg-rose-500/10 retro:border-rose-500/50 retro:shadow-[inset_0_0_10px_rgba(244,63,94,0.3)]">
											<Terminal className="w-5 h-5 text-rose-600 dark:text-rose-400 retro:text-rose-400" />
										</div>
									</CardContent>
								</Card>
							</div>
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
						{activeProjects.map((project, index) => (
							<Card
								key={project.id}
								style={{
									animationDelay: `${index * 50}ms`,
									animationFillMode: "both",
								}}
								className={`group relative overflow-hidden bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-zinc-200/50 dark:border-zinc-800/50 hover:border-zinc-300/80 dark:hover:border-zinc-700/80 hover:shadow-xl dark:hover:shadow-zinc-900/50 hover:-translate-y-1 transition-all duration-300 ease-out animate-in fade-in zoom-in-95 slide-in-from-bottom-4 retro:bg-black/80 retro:border-fuchsia-500/80 retro:shadow-[0_0_15px_rgba(217,70,239,0.3)] retro:hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] retro:hover:border-cyan-400 ${project.status === "stopped" ? "opacity-70 grayscale-[20%]" : ""}`}
							>
								<div className="hidden retro:block absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-0"></div>
								<CardHeader className="pb-3 flex flex-row items-center justify-between relative z-10">
									<CardTitle className="text-lg font-medium retro:text-cyan-400 retro:font-mono retro:uppercase retro:tracking-widest retro:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
										{project.name}
									</CardTitle>
									<Badge
										variant="outline"
										className={`shadow-sm bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 capitalize retro:bg-transparent retro:border-fuchsia-500/70 retro:text-fuchsia-300 retro:shadow-[0_0_10px_rgba(217,70,239,0.4)] ${getStatusColor(
											project.status,
										)}`}
									>
										{project.status.charAt(0).toUpperCase() +
											project.status.slice(1)}
									</Badge>
								</CardHeader>
								<CardContent className="relative z-10">
									<p className="text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors retro:text-zinc-400 retro:group-hover:text-fuchsia-200">
										{project.path}
									</p>
									{project.gitStatus?.isGit && (
										<div className="flex items-center gap-2 mt-2 text-xs font-medium">
											<div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 retro:text-cyan-400">
												<GitBranch className="w-3 h-3" />
												{project.gitStatus.branch}
											</div>
											{project.gitStatus.behind > 0 && (
												<div className="flex items-center gap-0.5 text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded-full retro:bg-rose-900/40 retro:text-rose-400 retro:shadow-[0_0_8px_rgba(244,63,94,0.4)]" title={`${project.gitStatus.behind} commit(s) de retard sur ${project.gitStatus.mainBranch}`}>
													<ArrowDown className="w-3 h-3" />
													{project.gitStatus.behind}
												</div>
											)}
										</div>
									)}
									<p
										className="text-xs text-zinc-400 dark:text-zinc-500 mt-2 font-mono line-clamp-1 bg-zinc-100/50 dark:bg-zinc-950/50 p-1.5 rounded-md retro:bg-fuchsia-950/30 retro:text-cyan-300/80 retro:border retro:border-fuchsia-500/30"
										title={project.command}
									>
										{project.command}
									</p>
								</CardContent>
								<CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between bg-zinc-50/30 dark:bg-zinc-900/30 relative z-10 retro:border-fuchsia-500/50 retro:bg-fuchsia-950/20">
									<div className="flex gap-1">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 hover:scale-110 active:scale-95 transition-all duration-200 retro:text-cyan-500 retro:hover:bg-cyan-500/20 retro:hover:text-cyan-300 retro:hover:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
											disabled={
												project.status !== "stopped" &&
												project.status !== "error"
											}
											onClick={() => handleAction(project.id, "start")}
										>
											<Play className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10 hover:scale-110 active:scale-95 transition-all duration-200 retro:text-fuchsia-500 retro:hover:bg-fuchsia-500/20 retro:hover:text-fuchsia-300 retro:hover:shadow-[0_0_10px_rgba(217,70,239,0.5)]"
											disabled={project.status === "stopped"}
											onClick={() => {
												handleAction(project.id, "stop");
												setTimeout(
													() => handleAction(project.id, "start"),
													500,
												);
											}}
										>
											<RefreshCw className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 hover:scale-110 active:scale-95 transition-all duration-200 retro:text-rose-500 retro:hover:bg-rose-500/20 retro:hover:text-rose-300 retro:hover:shadow-[0_0_10px_rgba(244,63,94,0.5)]"
											disabled={project.status === "stopped"}
											onClick={() => handleAction(project.id, "stop")}
										>
											<Square className="h-4 w-4" />
										</Button>
									</div>

									<Button
										variant="ghost"
										size="sm"
										className="text-zinc-500 h-8 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors retro:text-cyan-400 retro:hover:bg-cyan-500/20 retro:hover:text-cyan-300 retro:border retro:border-transparent retro:hover:border-cyan-500/50 retro:hover:shadow-[0_0_10px_rgba(34,211,238,0.4)]"
										disabled={project.status === "stopped"}
										onClick={() => {
											setActiveLogId(project.id);
											setIsLogsOpen(true);
										}}
									>
										<Terminal className="h-4 w-4 mr-2" />
										Logs
									</Button>
								</CardFooter>
							</Card>
						))}

						{projects.length === 0 && (
							<div className="col-span-full py-24 text-center flex flex-col items-center justify-center border-2 border-dashed border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
								<div className="w-16 h-16 mb-4 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm border border-zinc-100 dark:border-zinc-800">
									<Square className="w-8 h-8 text-zinc-400" />
								</div>
								<h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
									Aucun projet configuré
								</h3>
								<p className="text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
									Commencez par scanner un dossier pour détecter vos conteneurs
									Docker ou vos cibles Makefile.
								</p>
								<AddProjectModal />
							</div>
						)}
					</div>
				</main>

				{/* GLOBAL LOGS TERMINAL */}
				<Sheet open={isLogsOpen} onOpenChange={setIsLogsOpen}>
					<SheetContent
						side="bottom"
						className="h-[50vh] sm:h-[60vh] bg-zinc-950 text-zinc-100 border-t border-zinc-800 flex flex-col p-0"
					>
						<div className="flex flex-col h-full">
							<SheetHeader className="p-4 border-b border-zinc-800 bg-zinc-900">
								<SheetTitle className="text-zinc-300 font-mono text-sm flex items-center">
									<Terminal className="w-4 h-4 mr-2" />
									Terminal de Logs
								</SheetTitle>
							</SheetHeader>

							{activeProjects.length > 0 ? (
								<Tabs
									value={activeLogId || activeProjects[0]?.id || ""}
									onValueChange={setActiveLogId}
									className="flex-1 flex flex-col overflow-hidden"
								>
									<div className="bg-zinc-900 border-b border-zinc-800 px-4 pt-2">
										<TabsList className="bg-zinc-950 border border-zinc-800">
											{activeProjects.map((p) => (
												<TabsTrigger
													key={p.id}
													value={p.id}
													className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-400"
												>
													<span
														className={`w-2 h-2 rounded-full mr-2 ${
															p.status === "error"
																? "bg-rose-500"
																: p.status === "healthy"
																	? "bg-emerald-500"
																	: p.status === "waiting"
																		? "bg-purple-500"
																		: "bg-blue-500"
														}`}
													/>
													{p.name}
												</TabsTrigger>
											))}
										</TabsList>
									</div>

									<div className="flex-1 bg-black p-4 overflow-hidden">
										{activeProjects.map((p) => (
											<TabsContent
												key={p.id}
												value={p.id}
												className="h-full m-0 data-[state=active]:flex flex-col"
											>
												<ScrollArea className="h-full pr-4">
													<pre className="text-xs font-mono text-zinc-400 leading-relaxed whitespace-pre-wrap break-all">
														{activeLogId === p.id && activeLogs
															? activeLogs
															: `[EOS] Waiting for logs from ${p.name}...`}
													</pre>
												</ScrollArea>
											</TabsContent>
										))}
									</div>
								</Tabs>
							) : (
								<div className="flex-1 flex items-center justify-center text-zinc-500 font-mono text-sm">
									Aucun service en cours d'exécution.
								</div>
							)}
						</div>
					</SheetContent>
				</Sheet>
			</div>
		</div>
	);
}
