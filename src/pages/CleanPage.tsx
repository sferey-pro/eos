import { ArrowLeft, Trash2, HardDrive, Database, Box, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function CleanPage() {
	const navigate = useNavigate();
	const [isCleaningDocker, setIsCleaningDocker] = useState(false);
	const [isCleaningNode, setIsCleaningNode] = useState(false);
	const [dockerResult, setDockerResult] = useState<string | null>(null);
	const [nodeResult, setNodeResult] = useState<string | null>(null);
	
	// Utilisation du localStorage pour simuler un stockage persistant du total libéré (en Go)
	const [totalFreed, setTotalFreed] = useState<number>(() => {
		const stored = localStorage.getItem("eos_total_freed");
		return stored ? parseFloat(stored) : 0;
	});

	const addFreedSpace = (gigabytes: number) => {
		const newTotal = totalFreed + gigabytes;
		setTotalFreed(newTotal);
		localStorage.setItem("eos_total_freed", newTotal.toString());
	};

	const parseFreedString = (str: string): number => {
		// Convert "1.2GB" or "400MB" to GB
		if (str.includes("GB") || str.includes("Go")) return parseFloat(str) || 0;
		if (str.includes("MB") || str.includes("Mo")) return (parseFloat(str) || 0) / 1024;
		if (str.includes("B") || str.includes("o")) return (parseFloat(str) || 0) / 1024 / 1024 / 1024;
		return 0;
	};

	const handleDockerPrune = async () => {
		setIsCleaningDocker(true);
		setDockerResult(null);
		try {
			const res = await fetch("/api/clean/docker", { method: "POST" });
			const data = await res.json();
			if (data.success) {
				setDockerResult(data.reclaimed);
				addFreedSpace(parseFreedString(data.reclaimed));
			} else {
				setDockerResult("Erreur");
			}
		} catch (e) {
			setDockerResult("Erreur réseau");
		} finally {
			setIsCleaningDocker(false);
		}
	};

	const handleNodeClean = async () => {
		setIsCleaningNode(true);
		setNodeResult(null);
		try {
			const res = await fetch("/api/clean/node", { method: "POST" });
			const data = await res.json();
			if (data.success) {
				setNodeResult(data.reclaimed);
				addFreedSpace(parseFreedString(data.reclaimed));
			} else {
				setNodeResult("Erreur");
			}
		} catch (e) {
			setNodeResult("Erreur réseau");
		} finally {
			setIsCleaningNode(false);
		}
	};

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col gap-6 retro:bg-background retro:text-cyan-400">
			<div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
				<div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/50 pb-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/")} className="retro:hover:bg-cyan-500/20 retro:text-cyan-400">
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 retro:text-cyan-400 retro:font-mono retro:uppercase tracking-widest">
						Nettoyage Système
					</h1>
				</div>

				<div className="mb-8 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 retro:bg-black/60 retro:border-fuchsia-500/50 retro:shadow-[0_0_20px_rgba(217,70,239,0.3)] flex flex-col sm:flex-row items-center justify-between gap-6">
					<div className="flex items-center gap-4">
						<div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center retro:bg-fuchsia-500/20 retro:text-fuchsia-400 retro:shadow-[inset_0_0_15px_rgba(217,70,239,0.5)]">
							<Sparkles className="w-8 h-8" />
						</div>
						<div>
							<h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 retro:text-cyan-300 retro:font-mono uppercase tracking-wider">Garbage Collector</h2>
							<p className="text-sm text-zinc-500 dark:text-zinc-400 retro:text-cyan-500/70">Gardez votre machine réactive et optimisée</p>
						</div>
					</div>
					<div className="text-center sm:text-right">
						<p className="text-4xl font-black text-zinc-900 dark:text-zinc-100 retro:text-transparent retro:bg-clip-text retro:bg-gradient-to-r retro:from-cyan-400 retro:to-fuchsia-500 retro:drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">
							{totalFreed.toFixed(2)} Go
						</p>
						<p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest retro:text-cyan-500">libérés depuis l'installation d'EOS</p>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<Card className="retro:bg-black/40 retro:border-cyan-500/30 retro:hover:border-cyan-400 retro:hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 retro:text-cyan-400 retro:font-mono uppercase">
								<Box className="w-5 h-5 text-blue-500 retro:text-cyan-400" />
								Docker Prune
							</CardTitle>
							<CardDescription className="retro:text-cyan-500/70">
								Supprime tous les conteneurs arrêtés, les réseaux non utilisés, les images fantômes (dangling) et les volumes orphelins.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button 
								onClick={handleDockerPrune} 
								disabled={isCleaningDocker}
								className="w-full bg-blue-600 hover:bg-blue-700 retro:bg-cyan-500/10 retro:border retro:border-cyan-500 retro:text-cyan-400 retro:hover:bg-cyan-500/30 retro:shadow-[0_0_10px_rgba(34,211,238,0.2)] retro:uppercase retro:tracking-widest"
							>
								{isCleaningDocker ? (
									<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Purge en cours...</>
								) : (
									<><Trash2 className="w-4 h-4 mr-2" /> Lancer le Docker Prune</>
								)}
							</Button>
							{dockerResult && (
								<p className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400 retro:text-fuchsia-400 retro:font-mono">
									{dockerResult === "Erreur" || dockerResult === "Erreur réseau" 
										? "Échec de l'opération" 
										: `Terminé ! Espace libéré : ${dockerResult}`}
								</p>
							)}
						</CardContent>
					</Card>

					<Card className="retro:bg-black/40 retro:border-cyan-500/30 retro:hover:border-fuchsia-500 retro:hover:shadow-[0_0_15px_rgba(217,70,239,0.2)] transition-all">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 retro:text-fuchsia-400 retro:font-mono uppercase">
								<Database className="w-5 h-5 text-orange-500 retro:text-fuchsia-400" />
								Nettoyage Node_Modules
							</CardTitle>
							<CardDescription className="retro:text-cyan-500/70">
								Recherche et supprime les dossiers <code>node_modules</code> des projets non modifiés depuis plus de 6 mois.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button 
								onClick={handleNodeClean} 
								disabled={isCleaningNode}
								variant="outline"
								className="w-full border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 retro:bg-transparent retro:border-fuchsia-500 retro:text-fuchsia-400 retro:hover:bg-fuchsia-500/20 retro:shadow-[0_0_10px_rgba(217,70,239,0.2)] retro:uppercase retro:tracking-widest"
							>
								{isCleaningNode ? (
									<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyse & Purge...</>
								) : (
									<><Trash2 className="w-4 h-4 mr-2" /> Vider les vieux modules</>
								)}
							</Button>
							{nodeResult && (
								<p className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400 retro:text-fuchsia-400 retro:font-mono">
									{nodeResult === "Erreur" || nodeResult === "Erreur réseau" 
										? "Échec de l'opération" 
										: `Terminé ! Espace libéré : ${nodeResult}`}
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
