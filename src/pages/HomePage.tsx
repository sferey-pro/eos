import { FolderSearch } from "lucide-react";
import { AddProjectModal } from "@/components/AddProjectModal";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

export function HomePage() {
	const { theme } = useTheme();

	return (
		<div className="relative min-h-screen bg-zinc-950 retro:bg-background transition-all duration-500 overflow-hidden w-full flex items-center justify-center p-6">
			{/* Retro overlays */}
			<div className="fixed inset-0 z-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)_2px,transparent_2px,transparent_4px)] opacity-50 mix-blend-overlay"></div>
			<div className="fixed inset-0 z-0 pointer-events-none shadow-[inset_0_0_200px_rgba(255,0,255,0.15)]"></div>
			
			<div className="absolute inset-0 z-0 pointer-events-none [perspective:1000px] overflow-hidden">
				<div className="absolute bottom-0 w-[200%] h-[120%] -left-[50%] bg-[linear-gradient(to_right,var(--color-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-primary)_1px,transparent_1px)] bg-[size:60px_60px] [transform:rotateX(75deg)_translateY(200px)_translateZ(-200px)] opacity-30 shadow-[0_0_20px_var(--color-primary)] [mask-image:linear-gradient(to_bottom,transparent,black_40%)]"></div>
			</div>

			<div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center text-center space-y-10 p-10 bg-black/40 backdrop-blur-md border border-fuchsia-500/30 rounded-3xl shadow-[0_0_50px_rgba(217,70,239,0.2)]">
				<div className="relative w-64 h-64 mb-4">
					<div className="absolute -inset-4 rounded-full bg-cyan-500/20 blur-2xl animate-pulse" />
					{theme === 'retro' ? (
						<img src="/eos-logo-retro.jpg" alt="EOS Logo Retro" className="relative w-full h-full rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)]" />
					) : (
						<img src="/eos-logo.jpg" alt="EOS Logo" className="relative w-full h-full rounded-full object-cover border-2 border-zinc-200 dark:border-zinc-800" />
					)}
				</div>
				
				<div className="space-y-4">
					<h2 className="text-xl text-zinc-600 dark:text-zinc-400 retro:text-cyan-300 font-mono uppercase tracking-[0.3em] font-medium retro:drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
						Environment Operating System
					</h2>
				</div>
				
				<p className="text-lg text-fuchsia-300/80 max-w-lg mx-auto font-medium">
					Bienvenue dans votre nouveau terminal de commande. Gagnez un temps précieux en scannant vos projets locaux et laissez EOS orchestrer vos conteneurs Docker et vos scripts.
				</p>

				<div className="pt-8">
					<AddProjectModal trigger={
						<Button size="lg" className="h-16 px-10 text-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-mono uppercase tracking-widest border-2 border-fuchsia-400 shadow-[0_0_25px_rgba(217,70,239,0.5),inset_0_0_15px_rgba(217,70,239,0.5)] hover:shadow-[0_0_35px_rgba(217,70,239,0.7),inset_0_0_20px_rgba(217,70,239,0.7)] hover:scale-105 transition-all duration-300 cursor-pointer">
							<FolderSearch className="w-6 h-6 mr-3" />
							Scanner un dossier
						</Button>
					} />
				</div>
			</div>
		</div>
	);
}
