import { Play, RefreshCw, Square, Terminal } from "lucide-react";
import { AddProjectModal } from "@/components/AddProjectModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";

export function HomePage() {
	return (
		<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
			{/* HEADER */}
			<header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
				<div className="container mx-auto px-4 h-16 flex items-center justify-between">
					{/* Logo & Title */}
					<div className="flex items-center gap-3">
						<img
							src="/eos-logo.jpg"
							alt="EOS Logo"
							className="w-8 h-8 rounded-full object-cover shadow-sm"
						/>
						<h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
							EOS
						</h1>
					</div>

					{/* Center: Presets */}
					<div className="hidden md:flex items-center gap-2">
						<Select defaultValue="all">
							<SelectTrigger className="w-[200px]">
								<SelectValue placeholder="Choisir un preset..." />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tout lancer (Défaut)</SelectItem>
								<SelectItem value="backend">Backend Uniquement</SelectItem>
								<SelectItem value="frontend">Frontend + Storybook</SelectItem>
							</SelectContent>
						</Select>
						<Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white shadow-lg transition-all hover:scale-105">
							<Play className="w-4 h-4 mr-2" />
							Aurore
						</Button>
					</div>

					{/* Right: Actions */}
					<div className="flex items-center gap-2">
						<AddProjectModal />
						<ThemeToggle />
					</div>
				</div>
			</header>

			{/* MAIN CONTENT */}
			<main className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{/* Card Mockup 1 */}
					<Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
						<CardHeader className="pb-3 flex flex-row items-center justify-between">
							<CardTitle className="text-lg font-medium">api-gateway</CardTitle>
							<Badge
								variant="outline"
								className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
							>
								Healthy
							</Badge>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								./services/api-gateway
							</p>
							<p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
								docker compose up -d api
							</p>
						</CardContent>
						<CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-zinc-400 hover:text-emerald-500"
								>
									<Play className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-zinc-400 hover:text-amber-500"
								>
									<RefreshCw className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-zinc-400 hover:text-rose-500"
								>
									<Square className="h-4 w-4" />
								</Button>
							</div>
							<Sheet>
								<SheetTrigger asChild>
									<Button
										variant="ghost"
										size="sm"
										className="text-zinc-500 h-8"
									>
										<Terminal className="h-4 w-4 mr-2" />
										Logs
									</Button>
								</SheetTrigger>
								<SheetContent
									side="bottom"
									className="h-[40vh] sm:h-[50vh] bg-black text-zinc-100 border-t border-zinc-800"
								>
									<SheetHeader>
										<SheetTitle className="text-zinc-300 font-mono text-sm flex items-center">
											<Terminal className="w-4 h-4 mr-2" />
											Logs: api-gateway
										</SheetTitle>
									</SheetHeader>
									<ScrollArea className="h-full mt-4 rounded-md border border-zinc-800 bg-zinc-950 p-4">
										<pre className="text-xs font-mono text-zinc-400 leading-relaxed">
											[INFO] Starting api-gateway...{"\n"}
											[INFO] Connecting to postgres:5432...{"\n"}
											<span className="text-emerald-400">
												[OK] Connected successfully.
											</span>
											{"\n"}
											[INFO] Server listening on port 3000
										</pre>
									</ScrollArea>
								</SheetContent>
							</Sheet>
						</CardFooter>
					</Card>

					{/* Card Mockup 2 */}
					<Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
						<CardHeader className="pb-3 flex flex-row items-center justify-between">
							<CardTitle className="text-lg font-medium">postgres-db</CardTitle>
							<Badge
								variant="outline"
								className="text-amber-500 border-amber-500/30 bg-amber-500/10"
							>
								Starting...
							</Badge>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								./docker/infra
							</p>
							<p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
								make start-db
							</p>
						</CardContent>
						<CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-zinc-400 hover:text-emerald-500"
									disabled
								>
									<Play className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-zinc-400 hover:text-amber-500"
								>
									<RefreshCw className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-zinc-400 hover:text-rose-500"
								>
									<Square className="h-4 w-4" />
								</Button>
							</div>
							<Button variant="ghost" size="sm" className="text-zinc-500 h-8">
								<Terminal className="h-4 w-4 mr-2" />
								Logs
							</Button>
						</CardFooter>
					</Card>

					{/* Card Mockup 3 */}
					<Card className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur border-zinc-200 dark:border-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all opacity-70">
						<CardHeader className="pb-3 flex flex-row items-center justify-between">
							<CardTitle className="text-lg font-medium">
								worker-queue
							</CardTitle>
							<Badge
								variant="outline"
								className="text-zinc-500 border-zinc-500/30 bg-zinc-500/10"
							>
								Stopped
							</Badge>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								./services/worker
							</p>
							<p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
								bun run start
							</p>
						</CardContent>
						<CardFooter className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
							<div className="flex gap-1">
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-zinc-400 hover:text-emerald-500"
								>
									<Play className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-zinc-400 hover:text-amber-500"
									disabled
								>
									<RefreshCw className="h-4 w-4" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-zinc-400 hover:text-rose-500"
									disabled
								>
									<Square className="h-4 w-4" />
								</Button>
							</div>
							<Button
								variant="ghost"
								size="sm"
								className="text-zinc-500 h-8"
								disabled
							>
								<Terminal className="h-4 w-4 mr-2" />
								Logs
							</Button>
						</CardFooter>
					</Card>
				</div>
			</main>
		</div>
	);
}
