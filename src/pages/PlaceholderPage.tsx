import { Construction, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";

export function PlaceholderPage() {
	const navigate = useNavigate();
	const location = useLocation();

	const pageTitles: Record<string, string> = {
		"/containers": "Conteneurs Actifs",
		"/volumes": "Volumes & Bases de données",
		"/networks": "Réseaux",
		"/terminal": "Terminal Global",
		"/metrics": "Performances",
		"/clean": "Nettoyage Système",
		"/proxy": "Reverse Proxy",
		"/theme": "Personnalisation",
		"/notifications": "Notifications",
	};

	const title = pageTitles[location.pathname] || "En construction";

	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col gap-6 retro:bg-background retro:text-cyan-400">
			<div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
				<div className="flex items-center gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800 retro:border-fuchsia-500/50 pb-4">
					<SidebarTrigger className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 retro:text-cyan-400" />
					<Button variant="ghost" size="icon" onClick={() => navigate("/")} className="retro:hover:bg-cyan-500/20 retro:text-cyan-400">
						<ArrowLeft className="w-5 h-5" />
					</Button>
					<h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 retro:text-cyan-400 retro:font-mono retro:uppercase tracking-widest">
						{title}
					</h1>
				</div>

				<div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all retro:border-cyan-400/50 retro:bg-black/60 retro:shadow-[0_0_15px_rgba(34,211,238,0.2)]">
					<div className="w-20 h-20 mb-6 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm border border-zinc-100 dark:border-zinc-800 retro:bg-fuchsia-500/10 retro:border-fuchsia-500/50 retro:shadow-[inset_0_0_15px_rgba(217,70,239,0.4)]">
						<Construction className="w-10 h-10 text-zinc-400 retro:text-fuchsia-400" />
					</div>
					<h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2 retro:text-fuchsia-400 retro:font-mono retro:uppercase retro:tracking-widest retro:drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]">
						Module en cours de développement
					</h3>
					<p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-center mb-6 retro:text-cyan-300">
						La vue dédiée pour <strong>{title}</strong> sera bientôt disponible dans une prochaine mise à jour de votre EOS.
					</p>
					<Button onClick={() => navigate("/")} className="retro:bg-transparent retro:border-2 retro:border-[#00ffff] retro:text-[#00ffff] retro:hover:bg-[#00ffff]/20 retro:shadow-[0_0_10px_#00ffff,inset_0_0_5px_#00ffff] retro:uppercase retro:tracking-widest">
						Retour au tableau de bord
					</Button>
				</div>
			</div>
		</div>
	);
}
