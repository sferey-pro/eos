import { Check, Loader2, Plus, Search, FolderSearch, Terminal, Box, Wrench } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ProjectProposal } from "../lib/scanner";

export function AddProjectModal({ trigger }: { trigger?: React.ReactNode }) {
	const [open, setOpen] = useState(false);
	const [path, setPath] = useState("");
	const [isScanning, setIsScanning] = useState(false);
	const [proposals, setProposals] = useState<ProjectProposal[]>([]);
	const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
		new Set(),
	);
	const [isSaving, setIsSaving] = useState(false);
	const [hasScanned, setHasScanned] = useState(false);

	const handleScan = useCallback(async () => {
		if (!path) return;
		setIsScanning(true);
		setHasScanned(false);
		try {
			const res = await fetch("/api/scan", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ targetPath: path }),
			});
			const data = await res.json();
			setProposals(data.proposals || []);
			setSelectedIndices(new Set());
			setHasScanned(true);
		} catch (e) {
			console.error(e);
		} finally {
			setIsScanning(false);
		}
	}, [path]);

	const toggleSelection = useCallback((index: number) => {
		setSelectedIndices(prev => {
			const newSet = new Set(prev);
			if (newSet.has(index)) newSet.delete(index);
			else newSet.add(index);
			return newSet;
		});
	}, []);

	const groupedProposals = useMemo(() => {
		const groups: Record<string, { proposal: ProjectProposal; index: number }[]> = {};
		proposals.forEach((prop, index) => {
			if (!groups[prop.type]) groups[prop.type] = [];
			groups[prop.type]!.push({ proposal: prop, index });
		});
		return groups;
	}, [proposals]);

	const toggleGroup = useCallback((type: string, isAllSelected: boolean) => {
		setSelectedIndices(prev => {
			const newSet = new Set(prev);
			groupedProposals[type]?.forEach(({ index }) => {
				if (isAllSelected) newSet.delete(index);
				else newSet.add(index);
			});
			return newSet;
		});
	}, [groupedProposals]);

	const handleSave = useCallback(async () => {
		const selectedProposals = proposals.filter((_, i) =>
			selectedIndices.has(i),
		);
		if (selectedProposals.length === 0) return;

		setIsSaving(true);
		try {
			await fetch("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(selectedProposals),
			});
			// Reset et fermeture
			setOpen(false);
			setPath("");
			setProposals([]);
			setHasScanned(false);
			// TODO: Rafraîchir la liste des projets du Dashboard
		} catch (e) {
			console.error(e);
		} finally {
			setIsSaving(false);
		}
	}, [proposals, selectedIndices]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button
						variant="outline"
						size="sm"
						className="hidden sm:flex transition-all hover:scale-105 active:scale-95 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
					>
						<Plus className="w-4 h-4 mr-2" />
						Ajouter
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[700px] bg-white/90 dark:bg-zinc-950/90 retro:bg-black/80 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 retro:border-fuchsia-500/50 shadow-2xl retro:shadow-[0_0_30px_rgba(217,70,239,0.3)] overflow-hidden transition-all duration-300">
				<DialogHeader>
					<DialogTitle className="retro:text-cyan-400 retro:font-mono retro:uppercase tracking-widest text-xl flex items-center gap-2">
						<FolderSearch className="w-5 h-5 text-fuchsia-500" />
						Scanner et Importer
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-5 py-2">
					<div className="flex gap-2 relative">
						<label htmlFor="project-path" className="sr-only">Chemin absolu du projet</label>
						<Input
							id="project-path"
							placeholder="Chemin absolu (ex: /home/user/my-project)"
							value={path}
							onChange={(e) => setPath(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleScan()}
							className="focus-visible:ring-fuchsia-500/30 transition-shadow bg-white/50 dark:bg-zinc-900/50 retro:bg-black/50 retro:border-cyan-500/50 retro:text-cyan-300 retro:font-mono retro:focus-visible:ring-cyan-500/50"
						/>
						<Button
							aria-label="Scanner le dossier"
							onClick={handleScan}
							disabled={isScanning || !path}
							className="transition-all active:scale-95 retro:bg-fuchsia-600 retro:hover:bg-fuchsia-500 retro:text-white retro:shadow-[0_0_15px_rgba(217,70,239,0.4)]"
						>
							{isScanning ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Search className="w-4 h-4" />
							)}
						</Button>
					</div>

					{proposals.length > 0 && (
						<div className="border border-zinc-200/50 dark:border-zinc-800/50 retro:border-cyan-500/30 rounded-xl p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/30 retro:bg-cyan-950/10 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[60vh]">
							<div className="flex justify-between items-center pb-2 border-b border-zinc-200 dark:border-zinc-800 retro:border-cyan-900">
								<h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 retro:text-cyan-400 retro:font-mono uppercase tracking-wider flex items-center gap-2">
									Commandes détectées
									<span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 retro:bg-fuchsia-500/20 retro:text-fuchsia-400 retro:border retro:border-fuchsia-500/50 py-0.5 px-2 rounded-md text-xs font-bold">
										{proposals.length}
									</span>
								</h4>
								<span className="text-xs font-mono retro:text-cyan-500">
									Sélectionnez uniquement ce qui vous est utile
								</span>
							</div>
							
							<div className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 retro:scrollbar-thumb-cyan-700 space-y-6 flex-1">
								{Object.entries(groupedProposals).map(([type, items]) => {
									const isAllSelected = items.every(({ index }) => selectedIndices.has(index));
									const isSomeSelected = items.some(({ index }) => selectedIndices.has(index)) && !isAllSelected;
									
									let Icon = Terminal;
									if (type === "docker") Icon = Box;
									else if (type === "make") Icon = Wrench;

									return (
										<div key={type} className="space-y-3">
											<div className="flex items-center justify-between sticky top-0 bg-zinc-50/95 dark:bg-zinc-900/95 retro:bg-[#09090b]/95 backdrop-blur z-10 p-2 rounded-lg border border-transparent retro:border-cyan-500/20 shadow-sm">
												<div className="flex items-center gap-2">
													<Icon className="w-4 h-4 text-zinc-500 retro:text-fuchsia-400" />
													<span className="text-sm font-bold uppercase tracking-widest text-zinc-800 dark:text-zinc-200 retro:text-cyan-300">
														{type === "npm" || type === "bun" ? "Scripts Node/Bun" : type === "docker" ? "Conteneurs Docker" : type === "make" ? "Cibles Makefile" : type}
													</span>
													<span className="text-xs text-zinc-400 retro:text-cyan-600 font-mono">({items.length})</span>
												</div>
												<Button 
													variant="ghost" 
													size="sm" 
													className="h-7 text-xs retro:text-cyan-400 retro:hover:bg-cyan-500/20 retro:font-mono uppercase"
													onClick={() => toggleGroup(type, isAllSelected)}
												>
													{isAllSelected ? "Tout décocher" : "Tout cocher"}
												</Button>
											</div>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-2">
												{items.map(({ proposal: prop, index: i }) => (
													<label
														key={prop.name}
														htmlFor={`prop-${i}`}
														className={`flex items-start space-x-3 p-3 rounded-lg border hover:bg-white dark:hover:bg-zinc-800/50 hover:shadow-sm transition-all duration-200 cursor-pointer ${selectedIndices.has(i) ? "bg-white dark:bg-zinc-800/80 border-emerald-500 dark:border-emerald-500/50 retro:bg-cyan-950/30 retro:border-cyan-400 retro:shadow-[0_0_10px_rgba(34,211,238,0.2)] shadow-sm" : "border-zinc-200 dark:border-zinc-800 retro:border-zinc-800 retro:bg-black/40"}`}
													>
														<Checkbox
															id={`prop-${i}`}
															checked={selectedIndices.has(i)}
															onCheckedChange={() => toggleSelection(i)}
															className="mt-1 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 retro:data-[state=checked]:bg-cyan-400 retro:data-[state=checked]:border-cyan-400 transition-colors"
														/>
														<div className="grid gap-1.5 leading-none flex-1 overflow-hidden">
															<span className="text-sm font-semibold leading-none select-none truncate retro:text-cyan-100">
																{prop.name}
															</span>
															<p className="text-xs text-zinc-400 dark:text-zinc-500 retro:text-fuchsia-400/80 font-mono mt-1 bg-zinc-50 dark:bg-zinc-950 retro:bg-fuchsia-950/20 p-1.5 rounded inline-block border border-zinc-100 dark:border-zinc-800/50 retro:border-fuchsia-500/20 truncate" title={prop.command}>
																{prop.command}
															</p>
														</div>
													</label>
												))}
											</div>
										</div>
									);
								})}
							</div>
							<div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 retro:border-cyan-900 flex justify-end">
								<Button
									onClick={handleSave}
									disabled={selectedIndices.size === 0 || isSaving}
									className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 retro:bg-fuchsia-600 retro:hover:bg-fuchsia-500 retro:text-white retro:shadow-[0_0_15px_rgba(217,70,239,0.5)] retro:font-mono retro:uppercase tracking-widest transition-all hover:-translate-y-0.5 active:translate-y-0"
								>
									{isSaving ? (
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									) : (
										<Check className="w-4 h-4 mr-2" />
									)}
									Importer {selectedIndices.size} commande(s)
								</Button>
							</div>
						</div>
					)}

					{proposals.length === 0 && hasScanned && path && (
						<div className="text-center p-6 bg-zinc-50/50 dark:bg-zinc-900/20 retro:bg-black/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/50 animate-in fade-in duration-300 mt-4">
							<p className="text-sm text-zinc-500 dark:text-zinc-400 retro:text-fuchsia-300">
								Aucune configuration détectée dans ce dossier.
							</p>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
