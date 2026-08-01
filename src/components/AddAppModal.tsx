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
	const [icon, setIcon] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const handleSave = async () => {
		if (!name || !path || !command || !url) return;
		setIsSaving(true);

		const app = {
			name,
			path,
			command,
			url,
			icon: icon || undefined,
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
			setIcon("");
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
			<DialogContent className="sm:max-w-[425px] bg-white/90 dark:bg-zinc-950/90 retro:bg-black/90 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 retro:border-cyan-500/50 shadow-2xl retro:shadow-[0_0_30px_rgba(34,211,238,0.3)]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 retro:text-cyan-400 retro:font-mono uppercase tracking-widest">
						<Box className="w-5 h-5 retro:text-fuchsia-500" />
						Ajouter une Application
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-4 py-4">
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 retro:text-fuchsia-400 retro:font-mono">
							Nom de l'Application
						</label>
						<Input
							placeholder="ex: Aegis"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="retro:bg-black/50 retro:border-cyan-500/50 retro:text-cyan-300 retro:font-mono retro:focus-visible:ring-cyan-500/50"
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 retro:text-fuchsia-400 retro:font-mono">
							Chemin du dossier
						</label>
						<Input
							placeholder="/absolute/path/to/app"
							value={path}
							onChange={(e) => setPath(e.target.value)}
							className="retro:bg-black/50 retro:border-cyan-500/50 retro:text-cyan-300 retro:font-mono retro:focus-visible:ring-cyan-500/50"
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 retro:text-fuchsia-400 retro:font-mono">
							Commande de démarrage
						</label>
						<Input
							placeholder="ex: bun run dev"
							value={command}
							onChange={(e) => setCommand(e.target.value)}
							className="font-mono text-sm retro:bg-black/50 retro:border-cyan-500/50 retro:text-cyan-300 retro:focus-visible:ring-cyan-500/50"
						/>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 retro:text-fuchsia-400 retro:font-mono">
							URL d'accès locale
						</label>
						<Input
							placeholder="http://localhost:3000"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							className="font-mono text-sm retro:bg-black/50 retro:border-cyan-500/50 retro:text-cyan-300 retro:focus-visible:ring-cyan-500/50"
						/>
						<p className="text-xs text-zinc-500">
							C'est l'URL qui s'ouvrira dans l'interface EOS quand l'app sera
							lancée.
						</p>
					</div>
					<div className="space-y-2">
						<label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 retro:text-fuchsia-400 retro:font-mono">
							Lien du logo (URL) <span className="text-zinc-400 text-xs font-normal">(optionnel)</span>
						</label>
						<Input
							placeholder="https://example.com/logo.png"
							value={icon}
							onChange={(e) => setIcon(e.target.value)}
							className="font-mono text-sm retro:bg-black/50 retro:border-cyan-500/50 retro:text-cyan-300 retro:focus-visible:ring-cyan-500/50"
						/>
					</div>
					<div className="pt-4 flex justify-end">
						<Button
							onClick={handleSave}
							disabled={!name || !path || !command || !url || isSaving}
							className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 retro:bg-fuchsia-600 retro:hover:bg-fuchsia-500 retro:text-white retro:font-mono uppercase tracking-widest retro:shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-all"
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
