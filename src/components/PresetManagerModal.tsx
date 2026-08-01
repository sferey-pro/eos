import { useEffect, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import type { Preset, Project } from "@/lib/schemas";
import { Checkbox } from "@/components/ui/checkbox";

export function PresetManagerModal({
	projects,
	onPresetsChange,
}: {
	projects: Project[];
	onPresetsChange?: () => void;
}) {
	const [open, setOpen] = useState(false);
	const [presets, setPresets] = useState<Preset[]>([]);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [editProjectIds, setEditProjectIds] = useState<string[]>([]);

	const fetchPresets = async () => {
		try {
			const res = await fetch("/api/presets");
			if (res.ok) {
				const data = await res.json();
				setPresets(data.presets || []);
			}
		} catch (error) {
			console.error("Failed to fetch presets:", error);
		}
	};

	useEffect(() => {
		if (open) {
			fetchPresets();
			setEditingId(null);
		}
	}, [open]);

	const handleSave = async (id: string) => {
		if (!editName.trim()) return;

		const isNew = id.startsWith("new-");
		const url = "/api/presets";
		const method = isNew ? "POST" : "PUT";
		
		const payload = {
			id: isNew ? crypto.randomUUID() : id,
			name: editName,
			projectIds: editProjectIds,
		};

		try {
			await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			setEditingId(null);
			fetchPresets();
			onPresetsChange?.();
		} catch (error) {
			console.error("Failed to save preset:", error);
		}
	};

	const handleDelete = async (id: string) => {
		if (id.startsWith("new-")) {
			setEditingId(null);
			return;
		}
		try {
			await fetch("/api/presets", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id }),
			});
			fetchPresets();
			onPresetsChange?.();
		} catch (error) {
			console.error("Failed to delete preset:", error);
		}
	};

	const startEdit = (preset?: Preset) => {
		if (preset) {
			setEditingId(preset.id);
			setEditName(preset.name);
			setEditProjectIds(preset.projectIds);
		} else {
			setEditingId("new-preset");
			setEditName("Nouveau Preset");
			setEditProjectIds([]);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
					title="Gérer les presets"
				>
					<Settings className="w-4 h-4" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Gestion des Presets</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-4">
					<div className="flex justify-end">
						<Button size="sm" onClick={() => startEdit()} disabled={!!editingId}>
							<Plus className="w-4 h-4 mr-2" />
							Nouveau
						</Button>
					</div>

					<div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
						{presets.map((preset) => (
							<div
								key={preset.id}
								className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 bg-zinc-50/50 dark:bg-zinc-900/50"
							>
								{editingId === preset.id ? (
									<div className="flex flex-col gap-3">
										<div className="flex items-center gap-2">
											<Input
												value={editName}
												onChange={(e) => setEditName(e.target.value)}
												placeholder="Nom du preset..."
												className="h-8"
											/>
											<Button
												size="sm"
												variant="ghost"
												className="h-8 w-8 p-0 text-emerald-500"
												onClick={() => handleSave(preset.id)}
											>
												<Check className="w-4 h-4" />
											</Button>
											<Button
												size="sm"
												variant="ghost"
												className="h-8 w-8 p-0"
												onClick={() => setEditingId(null)}
											>
												<X className="w-4 h-4" />
											</Button>
										</div>
										<div className="text-sm font-medium text-zinc-500 mt-2">
											Projets inclus :
										</div>
										<div className="grid grid-cols-2 gap-2">
											{projects.map((p) => (
												<div key={p.id} className="flex items-center gap-2">
													<Checkbox
														id={`project-${p.id}`}
														checked={editProjectIds.includes(p.id)}
														onCheckedChange={(checked) => {
															if (checked) {
																setEditProjectIds([...editProjectIds, p.id]);
															} else {
																setEditProjectIds(
																	editProjectIds.filter((id) => id !== p.id),
																);
															}
														}}
													/>
													<label
														htmlFor={`project-${p.id}`}
														className="text-sm cursor-pointer truncate"
													>
														{p.name}
													</label>
												</div>
											))}
										</div>
									</div>
								) : (
									<div className="flex items-center justify-between">
										<div className="flex flex-col">
											<span className="font-medium text-sm">{preset.name}</span>
											<span className="text-xs text-zinc-500">
												{preset.projectIds.length} projet(s)
											</span>
										</div>
										<div className="flex items-center gap-1">
											<Button
												size="sm"
												variant="ghost"
												className="h-8 w-8 p-0"
												onClick={() => startEdit(preset)}
											>
												<Edit2 className="w-4 h-4" />
											</Button>
											<Button
												size="sm"
												variant="ghost"
												className="h-8 w-8 p-0 text-rose-500"
												onClick={() => handleDelete(preset.id)}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</div>
								)}
							</div>
						))}

						{editingId === "new-preset" && (
							<div className="border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50/30 dark:bg-indigo-900/10">
								<div className="flex flex-col gap-3">
									<div className="flex items-center gap-2">
										<Input
											value={editName}
											onChange={(e) => setEditName(e.target.value)}
											placeholder="Nom du preset..."
											className="h-8"
										/>
										<Button
											size="sm"
											variant="ghost"
											className="h-8 w-8 p-0 text-emerald-500"
											onClick={() => handleSave("new-preset")}
										>
											<Check className="w-4 h-4" />
										</Button>
										<Button
											size="sm"
											variant="ghost"
											className="h-8 w-8 p-0"
											onClick={() => setEditingId(null)}
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
									<div className="text-sm font-medium text-zinc-500 mt-2">
										Projets inclus :
									</div>
									<div className="grid grid-cols-2 gap-2">
										{projects.map((p) => (
											<div key={p.id} className="flex items-center gap-2">
												<Checkbox
													id={`new-project-${p.id}`}
													checked={editProjectIds.includes(p.id)}
													onCheckedChange={(checked) => {
														if (checked) {
															setEditProjectIds([...editProjectIds, p.id]);
														} else {
															setEditProjectIds(
																editProjectIds.filter((id) => id !== p.id),
															);
														}
													}}
												/>
												<label
													htmlFor={`new-project-${p.id}`}
													className="text-sm cursor-pointer truncate"
												>
													{p.name}
												</label>
											</div>
										))}
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
