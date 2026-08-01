import { Check, Loader2, Plus, Search, Settings2 } from "lucide-react";
import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProjectProposal } from "../lib/scanner";

export function AddProjectModal() {
	const [open, setOpen] = useState(false);
	const [path, setPath] = useState("");
	const [isScanning, setIsScanning] = useState(false);
	const [proposals, setProposals] = useState<ProjectProposal[]>([]);
	const [selectedIndices, setSelectedIndices] = useState<Set<number>>(
		new Set(),
	);
	const [isSaving, setIsSaving] = useState(false);
	const [hasScanned, setHasScanned] = useState(false);

	// Manual Form State
	const [manualName, setManualName] = useState("");
	const [manualPath, setManualPath] = useState("");
	const [manualCommand, setManualCommand] = useState("");
	const [manualType, setManualType] = useState("bun");
	const [manualPort, setManualPort] = useState("");

	const handleScan = async () => {
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
	};

	const toggleSelection = (index: number) => {
		const newSet = new Set(selectedIndices);
		if (newSet.has(index)) newSet.delete(index);
		else newSet.add(index);
		setSelectedIndices(newSet);
	};

	const handleSave = async () => {
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
	};

	const handleManualSave = async () => {
		if (!manualName || !manualPath || !manualCommand) return;
		setIsSaving(true);
		
		const project = {
			name: manualName,
			path: manualPath,
			command: manualCommand,
			type: manualType,
			status: "stopped",
			dependsOn: [],
			healthcheck: manualPort ? { type: "tcp", target: manualPort } : { type: "none" }
		};

		try {
			await fetch("/api/projects", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify([project]),
			});
			setOpen(false);
			setManualName("");
			setManualPath("");
			setManualCommand("");
			setManualPort("");
		} catch (e) {
			console.error(e);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="hidden sm:flex transition-all hover:scale-105 active:scale-95 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
				>
					<Plus className="w-4 h-4 mr-2" />
					Ajouter
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl overflow-hidden transition-all duration-300">
				<DialogHeader>
					<DialogTitle>Ajouter un ou plusieurs projets</DialogTitle>
				</DialogHeader>

				<Tabs defaultValue="auto" className="w-full">
					<TabsList className="grid w-full grid-cols-2 mb-4 bg-zinc-100/50 dark:bg-zinc-900/50 p-1 rounded-lg">
						<TabsTrigger value="auto" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all">
							<Search className="w-4 h-4 mr-2" />
							Scanner auto
						</TabsTrigger>
						<TabsTrigger value="manual" className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all">
							<Settings2 className="w-4 h-4 mr-2" />
							Ajout manuel
						</TabsTrigger>
					</TabsList>

					<TabsContent value="auto" className="mt-0">
						<div className="flex flex-col gap-4 py-2">
							<div className="flex gap-2">
								<Input
									placeholder="Chemin absolu (ex: /home/user/my-project)"
									value={path}
									onChange={(e) => setPath(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleScan()}
									className="focus-visible:ring-emerald-500/30 dark:focus-visible:ring-emerald-500/30 transition-shadow bg-white/50 dark:bg-zinc-900/50"
								/>
								<Button
									onClick={handleScan}
									disabled={isScanning || !path}
									className="transition-all active:scale-95"
								>
									{isScanning ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Search className="w-4 h-4" />
									)}
								</Button>
							</div>

							{proposals.length > 0 && (
								<div className="border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg p-4 space-y-3 mt-2 bg-zinc-50/50 dark:bg-zinc-900/30 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
									<h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
										Commandes détectées
										<span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 py-0.5 px-2 rounded-full text-xs font-bold">
											{proposals.length}
										</span>
									</h4>
									<div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700">
										{proposals.map((prop, i) => (
											<label
												key={prop.name}
												htmlFor={`prop-${i}`}
												className={`flex items-start space-x-3 p-3 rounded-lg border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800/50 hover:shadow-sm transition-all duration-200 cursor-pointer ${selectedIndices.has(i) ? "bg-white dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 shadow-sm" : ""}`}
											>
												<Checkbox
													id={`prop-${i}`}
													checked={selectedIndices.has(i)}
													onCheckedChange={() => toggleSelection(i)}
													className="mt-1 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-colors"
												/>
												<div className="grid gap-1.5 leading-none flex-1">
													<span className="text-sm font-medium leading-none select-none">
														{prop.name}{" "}
														<span className="text-xs text-zinc-500 ml-2 px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
															{prop.type}
														</span>
													</span>
													<p className="text-xs text-zinc-400 dark:text-zinc-500 font-mono mt-1 bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded inline-block border border-zinc-100 dark:border-zinc-800/50">
														{prop.command}
													</p>
												</div>
											</label>
										))}
									</div>
									<div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
										<Button
											onClick={handleSave}
											disabled={selectedIndices.size === 0 || isSaving}
											className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
										>
											{isSaving ? (
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
											) : (
												<Check className="w-4 h-4 mr-2" />
											)}
											Importer {selectedIndices.size} projet(s)
										</Button>
									</div>
								</div>
							)}

							{proposals.length === 0 && hasScanned && path && (
								<div className="text-center p-6 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-300 mt-4">
									<p className="text-sm text-zinc-500 dark:text-zinc-400">
										Aucune configuration détectée dans ce dossier.
									</p>
								</div>
							)}
						</div>
					</TabsContent>

					<TabsContent value="manual" className="mt-0">
						<div className="flex flex-col gap-4 py-2">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Nom du projet</label>
									<Input placeholder="ex: Aegis" value={manualName} onChange={e => setManualName(e.target.value)} />
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Type</label>
									<Select value={manualType} onValueChange={setManualType}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="bun">Bun / Node</SelectItem>
											<SelectItem value="docker">Docker Compose</SelectItem>
											<SelectItem value="make">Makefile</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Chemin du dossier</label>
								<Input placeholder="/absolute/path/to/project" value={manualPath} onChange={e => setManualPath(e.target.value)} />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Commande de démarrage</label>
								<Input placeholder="ex: bun run dev" value={manualCommand} onChange={e => setManualCommand(e.target.value)} className="font-mono text-sm" />
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Port (Healthcheck)</label>
								<Input placeholder="ex: 3000 (optionnel)" value={manualPort} onChange={e => setManualPort(e.target.value)} />
								<p className="text-xs text-zinc-500">Si un port est défini, EOS surveillera ce port pour déclarer le service actif.</p>
							</div>
							<div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
								<Button
									onClick={handleManualSave}
									disabled={!manualName || !manualPath || !manualCommand || isSaving}
									className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
								>
									{isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
									Créer le projet
								</Button>
							</div>
						</div>
					</TabsContent>
				</Tabs>
			</DialogContent>
		</Dialog>
	);
}
