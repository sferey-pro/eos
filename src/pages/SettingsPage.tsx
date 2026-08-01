import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Plus, Trash2, Edit2, Check, X, ArrowLeft, Upload, Download, AlertTriangle } from "lucide-react";
import type { Preset, Project } from "@/lib/schemas";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";


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

	const handleClear = async () => {
		try {
			await fetch("/api/clear", { method: "POST" });
			fetchData(); // Reload everything
			alert("Configuration vidée avec succès !");
		} catch (err) {
			console.error("Clear failed", err);
			alert("Erreur lors de la suppression");
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

				<div className="flex flex-col gap-4 py-4 text-center mt-12">
					<p className="text-zinc-500 retro:text-cyan-600 font-mono">
						// Espace nettoyé pour la refonte de l'interface
					</p>
				</div>
			</div>
		</div>
	);
}
