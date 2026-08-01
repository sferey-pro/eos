import { Loader2, Plus, Box } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ReactNode } from "react";

export function AddAppModal({ children }: { children?: ReactNode }) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [path, setPath] = useState("");
	const [command, setCommand] = useState("");
	const [url, setUrl] = useState("http://localhost:3000");
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		if (!name || !path || !command || !url) return;
		setIsSaving(true);

		const app = {
			name,
			path,
			command,
			url,
			icon: "Box", // future extension: allow selecting an icon
			status: "stopped",
		};

		try {
			await fetch("/api/apps", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(app),
			});
			setOpen(false);
			setName("");
			setPath("");
			setCommand("");
			setUrl("http://localhost:3000");
		} catch (e) {
			console.error(e);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{children ? (
					children
				) : (
					<Button
						variant="outline"
						size="sm"
						className="hidden sm:flex transition-all hover:scale-105 active:scale-95 bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
					>
						<Plus className="w-4 h-4 mr-2" />
						Ajouter une App
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 shadow-2xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
						<Box className="w-5 h-5" />
						Ajouter une Application
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-4">
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
							Nom de l'Application
						</label>
						<Input
							placeholder="ex: Aegis"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
							Chemin du dossier
						</label>
						<Input
							placeholder="/absolute/path/to/app"
							value={path}
							onChange={(e) => setPath(e.target.value)}
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
							Commande de démarrage
						</label>
						<Input
							placeholder="ex: bun run dev"
							value={command}
							onChange={(e) => setCommand(e.target.value)}
							className="font-mono text-sm"
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
							URL d'accès locale
						</label>
						<Input
							placeholder="http://localhost:3000"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
						/>
						<p className="text-xs text-zinc-500">
							C'est l'URL qui s'ouvrira dans l'interface EOS quand l'app sera
							lancée.
						</p>
					</div>
					<div className="pt-4 flex justify-end">
						<Button
							onClick={handleSave}
							disabled={!name || !path || !command || !url || isSaving}
							className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
						>
							{isSaving ? (
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<Plus className="w-4 h-4 mr-2" />
							)}
							Ajouter l'App
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
