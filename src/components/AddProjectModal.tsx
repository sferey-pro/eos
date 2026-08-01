import { Check, Loader2, Plus, Search } from "lucide-react";
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

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm" className="hidden sm:flex">
					<Plus className="w-4 h-4 mr-2" />
					Ajouter
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
				<DialogHeader>
					<DialogTitle>Ajouter un ou plusieurs projets</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-4">
					<div className="flex gap-2">
						<Input
							placeholder="Chemin absolu (ex: /home/user/my-project)"
							value={path}
							onChange={(e) => setPath(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleScan()}
						/>
						<Button onClick={handleScan} disabled={isScanning || !path}>
							{isScanning ? (
								<Loader2 className="w-4 h-4 animate-spin" />
							) : (
								<Search className="w-4 h-4" />
							)}
						</Button>
					</div>

					{proposals.length > 0 && (
						<div className="border border-zinc-200 dark:border-zinc-800 rounded-md p-4 space-y-3 mt-2 bg-zinc-50 dark:bg-zinc-900/50">
							<h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
								Commandes détectées ({proposals.length})
							</h4>
							<div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
								{proposals.map((prop, i) => (
									<div
										key={prop.name}
										className="flex items-start space-x-3 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors"
									>
										<Checkbox
											id={`prop-${i}`}
											checked={selectedIndices.has(i)}
											onCheckedChange={() => toggleSelection(i)}
											className="mt-1"
										/>
										<div className="grid gap-1.5 leading-none flex-1">
											<label
												htmlFor={`prop-${i}`}
												className="text-sm font-medium leading-none cursor-pointer select-none"
											>
												{prop.name}{" "}
												<span className="text-xs text-zinc-500 ml-2 px-1.5 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-700">
													{prop.type}
												</span>
											</label>
											<p className="text-xs text-zinc-500 font-mono mt-1">
												{prop.command}
											</p>
										</div>
									</div>
								))}
							</div>
							<div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
								<Button
									onClick={handleSave}
									disabled={selectedIndices.size === 0 || isSaving}
									className="w-full sm:w-auto"
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
						<p className="text-sm text-zinc-500 text-center italic mt-4">
							Aucune configuration (Docker/Make) détectée dans ce dossier.
						</p>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
