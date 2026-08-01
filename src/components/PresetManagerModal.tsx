import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Copy, Upload, Trash2, Undo2, Star, Beaker, Rocket, Settings2 } from "lucide-react";
import type { Preset, Project } from "@/lib/schemas";

interface PresetManagerModalProps {
	trigger?: React.ReactNode;
}

export function PresetManagerModal({ trigger }: PresetManagerModalProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [presets, setPresets] = useState<Preset[]>([]);
	const [projects, setProjects] = useState<Project[]>([]);
	const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

	useEffect(() => {
		if (isOpen) {
			fetchData();
		}
	}, [isOpen]);

	const fetchData = async () => {
		try {
			const res = await fetch("/api/export");
			if (res.ok) {
				const data = await res.json();
				setPresets(data.presets || []);
				setProjects(data.projects || []);
				// Only auto-select if nothing is selected or if the currently selected one was deleted
				if (!selectedPresetId || !(data.presets || []).find((p: Preset) => p.id === selectedPresetId)) {
					if (data.presets?.length > 0) {
						setSelectedPresetId(data.presets[0].id);
					}
				}
			}
		} catch (e) {
			console.error("Failed to fetch presets:", e);
		}
	};

	const handleNewPreset = async () => {
		const newId = crypto.randomUUID();
		const newPreset: Preset = {
			id: newId,
			name: "New Preset",
			projectIds: projects.map(p => p.id),
		};
		try {
			await fetch("/api/presets", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newPreset),
			});
			setSelectedPresetId(newId);
			await fetchData();
		} catch (e) {
			console.error(e);
		}
	};

	const selectedPreset = presets.find(p => p.id === selectedPresetId);

	// Mocking environments visually based on names for the design
	const getIconForPreset = (name: string) => {
		if (name.toLowerCase().includes("local")) return <Star className="w-4 h-4 text-amber-500" />;
		if (name.toLowerCase().includes("front") || name.toLowerCase().includes("mock")) return <Beaker className="w-4 h-4 text-emerald-500" />;
		if (name.toLowerCase().includes("prod")) return <Rocket className="w-4 h-4 text-rose-500" />;
		return <Settings2 className="w-4 h-4 text-zinc-400" />;
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				{trigger || (
					<Button variant="outline" size="sm" className="h-8">
						Manage Presets
					</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-[1400px] max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden bg-[#0c0c0e] border-zinc-800 text-zinc-100 flex flex-col retro:bg-black/90 retro:border-fuchsia-500/50">
				<DialogHeader className="p-4 border-b border-zinc-800 retro:border-fuchsia-500/30">
					<DialogTitle className="text-lg font-medium retro:text-cyan-400 retro:font-mono uppercase tracking-wider">Preset Manager</DialogTitle>
				</DialogHeader>

				<div className="flex-1 flex overflow-hidden">
					{/* LEFT SIDEBAR */}
					<div className="w-1/4 min-w-[250px] border-r border-zinc-800 retro:border-fuchsia-500/30 flex flex-col bg-[#121214] retro:bg-black/60">
						<div className="p-4 border-b border-zinc-800/50 retro:border-fuchsia-500/20">
							<div className="relative">
								<Search className="absolute left-2.5 top-2 h-4 w-4 text-zinc-500" />
								<Input 
									placeholder="Search presets..." 
									className="h-8 pl-9 bg-[#1a1a1e] border-transparent focus-visible:ring-1 focus-visible:ring-zinc-700 retro:bg-cyan-950/20 retro:border-cyan-500/30 retro:text-cyan-300 retro:placeholder:text-cyan-700 text-sm"
								/>
							</div>
						</div>
						
						<div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
							<div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1 mt-2 retro:text-fuchsia-500/80">Environments</div>
							{presets.map(preset => (
								<div 
									key={preset.id}
									onClick={() => setSelectedPresetId(preset.id)}
									className={`flex items-center gap-2.5 px-3 py-2 rounded-md cursor-pointer transition-colors text-sm font-medium ${
										selectedPresetId === preset.id 
											? 'bg-[#1a1a1e] text-zinc-100 retro:bg-cyan-950/40 retro:text-cyan-300 retro:shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]' 
											: 'text-zinc-400 hover:text-zinc-200 hover:bg-[#161618] retro:text-cyan-600 retro:hover:bg-cyan-950/20'
									}`}
								>
									{getIconForPreset(preset.name)}
									<span className="truncate">{preset.name}</span>
								</div>
							))}
							
							{presets.length === 0 && (
								<div className="px-3 py-4 text-zinc-500 text-sm italic">No presets found.</div>
							)}
						</div>
						
						<div className="p-3 border-t border-zinc-800 retro:border-fuchsia-500/30">
							<Button onClick={handleNewPreset} variant="ghost" className="w-full justify-start text-zinc-400 hover:text-zinc-100 hover:bg-[#1a1a1e] retro:text-fuchsia-400 retro:hover:bg-fuchsia-500/20 retro:hover:text-fuchsia-300 h-9">
								<Plus className="w-4 h-4 mr-2" />
								New Preset
							</Button>
						</div>
					</div>

					{/* RIGHT MAIN PANEL */}
					<div className="flex-1 flex flex-col bg-[#0c0c0e] retro:bg-transparent overflow-hidden">
						{selectedPreset ? (
							<>
								<div className="p-6 border-b border-zinc-800/50 retro:border-fuchsia-500/20 flex items-center justify-between">
									<Input 
										value={selectedPreset.name}
										readOnly
										className="h-10 text-xl font-bold bg-transparent border-transparent hover:border-zinc-800 focus-visible:border-zinc-700 focus-visible:ring-0 px-2 w-1/2 retro:text-fuchsia-400 retro:font-mono retro:hover:border-fuchsia-500/50"
									/>
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm" className="h-8 bg-transparent border-zinc-700 hover:bg-zinc-800 text-zinc-300 retro:border-cyan-500/50 retro:text-cyan-400 retro:hover:bg-cyan-950/50">
											<Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
										</Button>
										<Button variant="outline" size="sm" className="h-8 bg-transparent border-zinc-700 hover:bg-zinc-800 text-zinc-300 retro:border-cyan-500/50 retro:text-cyan-400 retro:hover:bg-cyan-950/50">
											<Upload className="w-3.5 h-3.5 mr-2" /> Export
										</Button>
									</div>
								</div>
								
								<div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
									<h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4 retro:text-fuchsia-500/80">Micro-services Configurations</h3>
									
									<Accordion type="single" collapsible className="space-y-3">
										{projects.map((project) => (
											<AccordionItem key={project.id} value={project.id} className="border border-zinc-800 rounded-lg bg-[#121214] overflow-hidden retro:border-cyan-500/30 retro:bg-black/40 px-1">
												<AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-zinc-800/30 retro:hover:bg-cyan-950/30 transition-colors">
													<div className="flex items-center gap-3">
														<span className="font-medium text-sm retro:text-cyan-300">{project.name}</span>
													</div>
												</AccordionTrigger>
												<AccordionContent className="px-4 pb-4 pt-2 border-t border-zinc-800/50 retro:border-cyan-500/20 space-y-5">
													
													{/* Toggle switch for service */}
													<div className="flex items-center justify-between p-3 rounded-md bg-[#1a1a1e] border border-zinc-800 retro:bg-black/60 retro:border-cyan-500/30">
														<span className="text-sm font-medium text-zinc-300 retro:text-cyan-400">Enable this service</span>
														<Switch defaultChecked={true} className="data-[state=checked]:bg-emerald-500" />
													</div>

													{/* Launch Command Override */}
													<div className="space-y-2">
														<div className="flex items-center justify-between">
															<span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest retro:text-fuchsia-500/80">Launch Command</span>
															<Button variant="ghost" size="sm" className="h-6 text-xs text-zinc-500 hover:text-zinc-300 retro:text-cyan-600 retro:hover:text-cyan-400">
																<Undo2 className="w-3 h-3 mr-1.5" /> Reset
															</Button>
														</div>
														<Input 
															defaultValue={project.command} 
															className="font-mono text-xs h-9 bg-zinc-950 border-purple-500/50 focus-visible:ring-purple-500/50 retro:bg-black retro:border-fuchsia-500/50 retro:text-fuchsia-300 shadow-[0_0_10px_rgba(168,85,247,0.1)] retro:shadow-[0_0_10px_rgba(217,70,239,0.2)]"
														/>
														<p className="text-[10px] text-zinc-500 text-right italic">(overridden)</p>
													</div>

													{/* ENV Overrides */}
													<div className="space-y-2">
														<span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest retro:text-fuchsia-500/80">.env overrides</span>
														<div className="rounded-md border border-zinc-800 overflow-hidden retro:border-cyan-500/30">
															<table className="w-full text-sm">
																<thead className="bg-[#1a1a1e] border-b border-zinc-800 text-zinc-400 retro:bg-cyan-950/40 retro:border-cyan-500/30 retro:text-cyan-500">
																	<tr>
																		<th className="px-3 py-2 text-left font-medium w-5/12">Key</th>
																		<th className="px-3 py-2 text-left font-medium w-6/12">Value</th>
																		<th className="px-3 py-2 w-1/12"></th>
																	</tr>
																</thead>
																<tbody className="divide-y divide-zinc-800/50 retro:divide-cyan-500/20">
																	<tr className="bg-[#121214] retro:bg-black/40">
																		<td className="p-2"><Input defaultValue="PORT" className="h-7 text-xs font-mono bg-zinc-900 border-zinc-700 retro:bg-black retro:border-cyan-500/30 retro:text-cyan-300" /></td>
																		<td className="p-2"><Input defaultValue="8080" className="h-7 text-xs font-mono bg-zinc-900 border-zinc-700 retro:bg-black retro:border-cyan-500/30 retro:text-cyan-300" /></td>
																		<td className="p-2 text-center"><Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-rose-500 retro:text-cyan-700 retro:hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></Button></td>
																	</tr>
																	<tr className="bg-[#121214] retro:bg-black/40">
																		<td className="p-2"><Input defaultValue="NODE_ENV" className="h-7 text-xs font-mono bg-zinc-900 border-zinc-700 retro:bg-black retro:border-cyan-500/30 retro:text-cyan-300" /></td>
																		<td className="p-2"><Input defaultValue="development" className="h-7 text-xs font-mono bg-zinc-900 border-zinc-700 retro:bg-black retro:border-cyan-500/30 retro:text-cyan-300" /></td>
																		<td className="p-2 text-center"><Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-rose-500 retro:text-cyan-700 retro:hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></Button></td>
																	</tr>
																</tbody>
															</table>
															<div className="p-2 bg-[#161618] border-t border-zinc-800 retro:bg-black/60 retro:border-cyan-500/30">
																<Button variant="ghost" size="sm" className="w-full h-7 text-xs border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 retro:border-cyan-500/50 retro:text-cyan-500 retro:hover:text-cyan-300">
																	+ Add variable
																</Button>
															</div>
														</div>
													</div>

												</AccordionContent>
											</AccordionItem>
										))}
									</Accordion>
								</div>
							</>
						) : (
							<div className="flex-1 flex items-center justify-center text-zinc-600 retro:text-cyan-800 font-mono text-sm">
								Select a preset to edit its configuration
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
