import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Plus, Trash2, Edit2, Check, X, ArrowLeft, Upload, Download } from "lucide-react";
import type { Preset, Project } from "@/lib/schemas";
import { Checkbox } from "@/components/ui/checkbox";

import { useNavigate } from "react-router-dom";

export function SettingsPage() {
	const navigate = useNavigate();
	const [projects, setProjects] = useState<Project[]>([]);
	const [presets, setPresets] = useState<Preset[]>([]);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editName, setEditName] = useState("");
	const [editProjectIds, setEditProjectIds] = useState<string[]>([]);

	const fetchData = async () => {
		try {
			const [resProj, resPres] = await Promise.all([
				fetch("/api/projects"),
				fetch("/api/presets")
			]);
			if (resProj.ok) {
				const data = await resProj.json();
				setProjects(data.projects || []);
			}
			if (resPres.ok) {
				const data = await resPres.json();
				setPresets(data.presets || []);
			}
		} catch (error) {
			console.error("Failed to fetch data:", error);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

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
		} catch (error) {
			console.error("Failed to delete preset:", error);
		}
	};

	const handleExport = async () => {
		try {
			const res = await fetch("/api/export");
			const data = await res.json();
			const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `eos-config-${new Date().toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (e) {
			console.error("Export failed", e);
		}
	};

	const handleImport = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "application/json";
		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = async (e) => {
				try {
					const content = e.target?.result as string;
					const data = JSON.parse(content);
					await fetch("/api/import", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify(data),
					});
					fetchData(); // Reload everything
					alert("Configuration importée avec succès !");
				} catch (err) {
					console.error("Import failed", err);
					alert("Erreur lors de l'import");
				}
			};
			reader.readAsText(file);
		};
		input.click();
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
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col gap-6 retro:bg-background retro:text-cyan-400">
			<div className="max-w-4xl mx-auto w-full">
				<div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/50 pb-4">
					<Button variant="ghost" size="icon" onClick={() => navigate("/")} className="retro:hover:bg-cyan-500/20 retro:text-cyan-400">
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 retro:text-cyan-400 retro:font-mono retro:uppercase tracking-widest">
						<Settings className="w-6 h-6 retro:text-fuchsia-500" />
						Configuration & Presets
					</h1>
				</div>

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

				<div className="flex flex-col gap-4 py-4 mt-8 border-t border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/50">
					<h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 retro:text-cyan-400 retro:font-mono retro:uppercase tracking-widest">
						Import / Export
					</h2>
					<p className="text-sm text-zinc-500 dark:text-zinc-400">
						Sauvegardez ou restaurez toute votre configuration (Projets, Presets, et Applications).
					</p>
					<div className="flex items-center gap-4 mt-2">
						<Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 text-white retro:bg-transparent retro:border-2 retro:border-cyan-400 retro:text-cyan-400 retro:hover:bg-cyan-400/20">
							<Download className="w-4 h-4 mr-2" />
							Exporter
						</Button>
						<Button onClick={handleImport} className="bg-indigo-600 hover:bg-indigo-700 text-white retro:bg-transparent retro:border-2 retro:border-fuchsia-500 retro:text-fuchsia-500 retro:hover:bg-fuchsia-500/20">
							<Upload className="w-4 h-4 mr-2" />
							Importer
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
