import { useState, useEffect } from "react";
import { FolderSearch, Play, Square, TerminalSquare, RefreshCw, Search, Activity, Cpu, MemoryStick, AlertTriangle } from "lucide-react";
import { AddProjectModal } from "@/components/AddProjectModal";
import { PresetManagerModal } from "@/components/PresetManagerModal";
import { TerminalComponent } from "@/components/TerminalComponent";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Project } from "@/lib/schemas";

export function HomePage() {
	const { theme } = useTheme();
	const [projects, setProjects] = useState<Project[]>([]);
	const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
	const [metrics, setMetrics] = useState<{ cpu: string, ram: string }>({ cpu: "0%", ram: "0%" });
	const [metricHistory, setMetricHistory] = useState<{ cpu: number, ram: number }[]>([]);

	const maxGraphPoints = 20;

	const fetchData = async () => {
		try {
			const res = await fetch("/api/projects");
			if (res.ok) {
				const data = await res.json();
				setProjects(data.projects || []);
				if (!selectedProjectId && data.projects?.length > 0) {
					setSelectedProjectId(data.projects[0].id);
				}
			}
		} catch (error) {
			console.error("Failed to fetch data:", error);
		}
	};

	useEffect(() => {
		fetchData();
		const interval = setInterval(fetchData, 2000);
		return () => clearInterval(interval);
	}, []);

	// Reset metric history when changing project
	useEffect(() => {
		setMetricHistory([]);
	}, [selectedProjectId]);

	useEffect(() => {
		if (!selectedProjectId) return;
		const fetchMetrics = async () => {
			try {
				const res = await fetch(`/api/metrics?id=${selectedProjectId}`);
				if (res.ok) {
					const data = await res.json();
					setMetrics(data);
					const cpuVal = parseFloat(data.cpu) || 0;
					const ramVal = parseFloat(data.ram) || 0;
					setMetricHistory(prev => {
						const next = [...prev, { cpu: cpuVal, ram: ramVal }];
						if (next.length > maxGraphPoints) return next.slice(next.length - maxGraphPoints);
						return next;
					});
				}
			} catch (e) {
				console.error(e);
			}
		};

		fetchMetrics();
		const metricsInterval = setInterval(fetchMetrics, 3000);
		return () => {
			clearInterval(metricsInterval);
		};
	}, [selectedProjectId]);

	const handleAction = async (id: string, action: "start" | "stop" | "restart") => {
		try {
			await fetch("/api/action", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id, action: action === "restart" ? "stop" : action }),
			});
			if (action === "restart") {
				setTimeout(() => {
					fetch("/api/action", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ id, action: "start" }),
					});
				}, 1000);
			}
			fetchData();
		} catch (e) {
			console.error("Action failed:", e);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "healthy":
			case "running":
				return "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";
			case "starting":
			case "waiting":
				return "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse";
			case "error":
				return "bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]";
			case "stopped":
			default:
				return "bg-zinc-400 dark:bg-zinc-600 retro:bg-zinc-700 shadow-none";
		}
	};

	const getStatusTextColor = (status: string) => {
		switch (status) {
			case "healthy":
			case "running": return "text-emerald-600 dark:text-emerald-400 retro:text-emerald-400";
			case "starting":
			case "waiting": return "text-amber-600 dark:text-amber-400 retro:text-amber-400";
			case "error": return "text-rose-600 dark:text-rose-400 retro:text-rose-400";
			case "stopped":
			default: return "text-zinc-500 dark:text-zinc-400 retro:text-zinc-500";
		}
	};

	const getStatusLabel = (status: string) => {
		if (status === "starting" || status === "waiting") return "Building...";
		return status.charAt(0).toUpperCase() + status.slice(1);
	};

	const buildSvgPath = (values: number[], maxVal: number) => {
		const padded = [...Array(Math.max(0, maxGraphPoints - values.length)).fill(0), ...values];
		const step = 100 / (maxGraphPoints - 1);
		
		let path = `M0 40 `;
		padded.forEach((val, i) => {
			const x = i * step;
			const scaledVal = (val / maxVal) * 40;
			const y = 40 - scaledVal;
			path += `L${x.toFixed(1)} ${y.toFixed(1)} `;
		});
		path += `L100 40 Z`;
		return path;
	};

	if (projects.length === 0) {
		return (
			<div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 retro:bg-background transition-all duration-500 overflow-hidden w-full flex items-center justify-center p-6">
				{/* Retro overlays */}
				<div className="hidden retro:block fixed inset-0 z-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)_2px,transparent_2px,transparent_4px)] opacity-50 mix-blend-overlay"></div>
				<div className="hidden retro:block fixed inset-0 z-0 pointer-events-none shadow-[inset_0_0_200px_rgba(255,0,255,0.15)]"></div>
				<div className="hidden retro:block absolute inset-0 z-0 pointer-events-none [perspective:1000px] overflow-hidden">
					<div className="absolute bottom-0 w-[200%] h-[120%] -left-[50%] bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:60px_60px] [transform:rotateX(75deg)_translateY(200px)_translateZ(-200px)] opacity-30 shadow-[0_0_20px_var(--color-primary)] [mask-image:linear-gradient(to_bottom,transparent,black_40%)]"></div>
				</div>

				<div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center text-center space-y-10 p-10 bg-white/80 dark:bg-black/40 retro:bg-black/60 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/30 rounded-3xl shadow-xl retro:shadow-[0_0_50px_rgba(217,70,239,0.2)]">
					<div className="relative w-64 h-64 mb-4">
						<div className="absolute -inset-4 rounded-full bg-cyan-500/20 blur-2xl animate-pulse retro:block hidden" />
						{theme === 'retro' ? (
							<img src="/eos-logo-retro.jpg" alt="EOS Logo Retro" className="relative w-full h-full rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)]" />
						) : (
							<img src="/eos-logo.jpg" alt="EOS Logo" className="relative w-full h-full rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-800 shadow-md" />
						)}
					</div>
					
					<div className="space-y-4">
						<h2 className="text-xl text-zinc-900 dark:text-zinc-100 retro:text-cyan-300 font-mono uppercase tracking-[0.3em] font-medium retro:drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
							Environment Operating System
						</h2>
					</div>
					
					<p className="text-lg text-zinc-600 dark:text-zinc-400 retro:text-fuchsia-300/80 max-w-lg mx-auto font-medium">
						Bienvenue dans votre nouveau terminal de commande. Gagnez un temps précieux en scannant vos projets locaux et laissez EOS orchestrer vos conteneurs Docker et vos scripts.
					</p>

					<div className="pt-8">
						<AddProjectModal trigger={
							<Button size="lg" className="h-16 px-10 text-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 retro:bg-fuchsia-600 retro:hover:bg-fuchsia-500 retro:text-white font-mono uppercase tracking-widest border-2 border-transparent retro:border-fuchsia-400 shadow-lg retro:shadow-[0_0_25px_rgba(217,70,239,0.5),inset_0_0_15px_rgba(217,70,239,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer">
								<FolderSearch className="w-6 h-6 mr-3" />
								Scanner un dossier
							</Button>
						} />
					</div>
				</div>
			</div>
		);
	}

	const selectedProject = projects.find(p => p.id === selectedProjectId) || projects[0];

	return (
		<div className="relative flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 retro:bg-[#050505] transition-all duration-500 overflow-hidden w-full font-sans text-zinc-900 dark:text-zinc-100 retro:text-cyan-400">
			{/* RETRO OVERLAYS */}
			<div className="hidden retro:block fixed inset-0 z-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] opacity-30 mix-blend-overlay"></div>
			<div className="hidden retro:block fixed inset-0 z-0 pointer-events-none shadow-[inset_0_0_150px_rgba(217,70,239,0.05)]"></div>

			{/* GLOBAL HEADER */}
			<header className="relative z-10 flex-none h-14 border-b border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/40 bg-white dark:bg-zinc-950 retro:bg-black/80 flex items-center justify-between px-4">
				<div className="flex items-center gap-6 w-1/3 min-w-[300px]">
					<div className="font-mono font-bold tracking-widest uppercase retro:text-fuchsia-400 retro:drop-shadow-[0_0_8px_rgba(217,70,239,0.6)] flex items-center gap-2">
						<div className="w-6 h-6 rounded-sm bg-zinc-900 dark:bg-zinc-100 retro:bg-cyan-400 retro:shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
						EOS
					</div>
					<div className="relative flex-1 max-w-sm">
						<Search className="absolute left-2.5 top-1.5 h-4 w-4 text-zinc-400 retro:text-cyan-500/70" />
						<Input 
							placeholder="Command palette..." 
							className="h-8 pl-9 bg-zinc-100 dark:bg-zinc-900 border-transparent focus-visible:ring-1 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600 retro:bg-black/60 retro:border-cyan-500/50 retro:text-cyan-300 retro:placeholder:text-cyan-700 retro:focus-visible:ring-cyan-400 retro:focus-visible:shadow-[0_0_10px_rgba(34,211,238,0.3)] font-mono text-xs rounded-sm"
						/>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<PresetManagerModal trigger={
						<Button variant="outline" size="sm" className="h-8 border-dashed retro:border-cyan-500/50 retro:text-cyan-400 retro:hover:bg-cyan-500/20 retro:hover:shadow-[0_0_10px_rgba(34,211,238,0.3)]">
							Manage Presets
						</Button>
					} />
					<AddProjectModal trigger={
						<Button variant="outline" size="sm" className="h-8 border-dashed retro:border-fuchsia-500/50 retro:text-fuchsia-400 retro:hover:bg-fuchsia-500/20 retro:hover:shadow-[0_0_10px_rgba(217,70,239,0.3)]">
							+ Add Service
						</Button>
					} />
					<Button 
						size="sm" 
						className="h-8 bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 retro:bg-transparent retro:border retro:border-emerald-500 retro:text-emerald-400 retro:hover:bg-emerald-500/20 retro:shadow-[0_0_10px_rgba(16,185,129,0.3)] retro:font-mono uppercase tracking-wider text-xs font-bold"
						onClick={() => projects.forEach(p => handleAction(p.id, "start"))}
					>
						<Play className="w-3.5 h-3.5 mr-1.5 retro:animate-pulse" />
						Start All ({projects.length})
					</Button>
				</div>
			</header>

			{/* SPLIT PANE CONTENT */}
			<div className="flex-1 flex overflow-hidden relative z-10">
				
				{/* LEFT PANE: SERVICES LIST */}
				<div className="w-1/3 min-w-[320px] max-w-[450px] flex flex-col border-r border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/30 bg-white/50 dark:bg-zinc-950/50 retro:bg-black/60 backdrop-blur-sm">
					<div className="h-10 border-b border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/20 flex items-center px-4 bg-zinc-50/50 dark:bg-zinc-900/50 retro:bg-black/40">
						<span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 retro:text-fuchsia-400/80 uppercase tracking-widest flex-1">Services</span>
						<span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 retro:text-cyan-500/60 uppercase tracking-widest w-24 text-right">States</span>
					</div>
					<div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
						{projects.map((project) => (
							<div 
								key={project.id}
								onClick={() => setSelectedProjectId(project.id)}
								className={`group flex items-center h-10 px-3 rounded-md cursor-pointer transition-colors border ${
									selectedProjectId === project.id 
										? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 retro:bg-cyan-950/30 retro:border-cyan-500/50 retro:shadow-[inset_0_0_15px_rgba(34,211,238,0.15)]' 
										: 'bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 retro:hover:bg-cyan-950/10 retro:hover:border-cyan-500/20'
								}`}
							>
								<div className="flex-1 min-w-0 truncate font-medium text-sm retro:font-mono retro:tracking-wide">
									{project.name}
								</div>
								
								<div className="flex items-center gap-3 shrink-0">
									<div className="flex items-center gap-2 w-24 justify-end">
										{project.status === "error" && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 retro:text-rose-400 shrink-0" />}
										<span className={`text-xs font-medium retro:font-mono retro:uppercase tracking-wider ${getStatusTextColor(project.status)}`}>
											{getStatusLabel(project.status)}
										</span>
										<div className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(project.status)}`} />
									</div>

									{/* HOVER ACTIONS */}
									<div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${selectedProjectId === project.id ? 'opacity-100' : ''}`}>
										{(project.status === "stopped" || project.status === "error") ? (
											<Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-500 retro:text-cyan-500 retro:hover:bg-emerald-500/20 retro:hover:text-emerald-400" onClick={(e) => { e.stopPropagation(); handleAction(project.id, "start"); }} title="Start">
												<Play className="w-3 h-3" />
											</Button>
										) : (
											<Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-500 retro:text-cyan-500 retro:hover:bg-rose-500/20 retro:hover:text-rose-400" onClick={(e) => { e.stopPropagation(); handleAction(project.id, "stop"); }} title="Stop">
												<Square className="w-3 h-3" />
											</Button>
										)}
										<Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 retro:text-cyan-500 retro:hover:bg-cyan-500/20 retro:hover:text-cyan-300" onClick={(e) => { e.stopPropagation(); handleAction(project.id, "restart"); }} title="Restart">
											<RefreshCw className="w-3 h-3" />
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* RIGHT PANE: DETAILS & LOGS */}
				<div className="flex-1 flex flex-col min-w-0 bg-white/30 dark:bg-zinc-950/30 retro:bg-transparent">
					{selectedProject ? (
						<>
							{/* Details Header & Mini Graphs */}
							<div className="flex-none p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/20">
								<div className="flex items-start justify-between mb-6">
									<div className="flex items-center gap-3">
										<h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 retro:text-cyan-300 retro:font-mono retro:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">{selectedProject.name}</h1>
										<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 retro:border-cyan-500/30 retro:bg-cyan-950/30 bg-zinc-100 dark:bg-zinc-900">
											<div className={`w-2 h-2 rounded-full ${getStatusColor(selectedProject.status)}`} />
											<span className={`text-xs font-semibold uppercase tracking-wider ${getStatusTextColor(selectedProject.status)}`}>{getStatusLabel(selectedProject.status)}</span>
										</div>
									</div>
									<Button variant="ghost" size="icon" className="retro:text-fuchsia-400 retro:hover:bg-fuchsia-500/20">
										<Activity className="w-4 h-4" />
									</Button>
								</div>

								{/* Real Mini-Utilization Graphs */}
								<div className="grid grid-cols-2 gap-8 h-24">
									<div className="flex flex-col gap-1 relative">
										<div className="flex items-center justify-between text-xs font-semibold text-zinc-500 retro:text-cyan-500/80 uppercase tracking-widest font-mono mb-2">
											<span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> CPU Utilization</span>
											<span className="text-zinc-900 dark:text-zinc-300 retro:text-cyan-300">{metrics.cpu}</span>
										</div>
										<div className="absolute bottom-0 left-0 right-0 h-12 flex items-end justify-between gap-1 opacity-50 retro:opacity-100 transition-all duration-300">
											<svg className="w-full h-full text-blue-500 retro:text-cyan-400 drop-shadow-sm retro:drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]" viewBox="0 0 100 40" preserveAspectRatio="none">
												<path 
													d={buildSvgPath(metricHistory.map(m => m.cpu), Math.max(100, ...metricHistory.map(m => m.cpu)))} 
													fill="currentColor" 
													fillOpacity="0.15" 
													stroke="currentColor" 
													strokeWidth="1.5" 
													className="transition-all duration-500 ease-linear"
												/>
											</svg>
										</div>
										<div className="absolute left-0 bottom-0 top-6 border-l border-dashed border-zinc-200 dark:border-zinc-800 retro:border-cyan-500/30"></div>
										<div className="absolute bottom-0 left-0 right-0 border-b border-dashed border-zinc-200 dark:border-zinc-800 retro:border-cyan-500/30"></div>
									</div>
									<div className="flex flex-col gap-1 relative">
										<div className="flex items-center justify-between text-xs font-semibold text-zinc-500 retro:text-fuchsia-500/80 uppercase tracking-widest font-mono mb-2">
											<span className="flex items-center gap-1.5"><MemoryStick className="w-3.5 h-3.5" /> RAM Usage</span>
											<span className="text-zinc-900 dark:text-zinc-300 retro:text-fuchsia-300">{metrics.ram}</span>
										</div>
										<div className="absolute bottom-0 left-0 right-0 h-12 flex items-end justify-between gap-1 opacity-50 retro:opacity-100 transition-all duration-300">
											<svg className="w-full h-full text-purple-500 retro:text-fuchsia-400 drop-shadow-sm retro:drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]" viewBox="0 0 100 40" preserveAspectRatio="none">
												<path 
													d={buildSvgPath(metricHistory.map(m => m.ram), 100)} 
													fill="currentColor" 
													fillOpacity="0.15" 
													stroke="currentColor" 
													strokeWidth="1.5" 
													className="transition-all duration-500 ease-linear"
												/>
											</svg>
										</div>
										<div className="absolute left-0 bottom-0 top-6 border-l border-dashed border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/30"></div>
										<div className="absolute bottom-0 left-0 right-0 border-b border-dashed border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/30"></div>
									</div>
								</div>
							</div>

							{/* Logs Console */}
							<div className="flex-1 flex flex-col p-4 min-h-0">
								<div className="flex items-center justify-between mb-2">
									<span className="text-xs font-semibold text-zinc-500 retro:text-cyan-600 uppercase tracking-widest font-mono flex items-center gap-2">
										<TerminalSquare className="w-3.5 h-3.5" />
										Logs / {selectedProject.name}
									</span>
								</div>
								<div className="flex-1 relative bg-[#0a0a0b] dark:bg-black retro:bg-black/80 rounded-md border border-zinc-200 dark:border-zinc-800 retro:border-cyan-500/40 shadow-inner overflow-hidden flex flex-col retro:shadow-[inset_0_0_20px_rgba(34,211,238,0.1)] p-4">
									<div className="flex-1 w-full h-full relative">
										<TerminalComponent projectId={selectedProjectId} />
									</div>
								</div>
							</div>
						</>
					) : (
						<div className="flex-1 flex items-center justify-center text-zinc-500 retro:text-cyan-700/50 font-mono text-sm uppercase tracking-widest">
							Select a service to view details
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
