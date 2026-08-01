import { Settings, PanelLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Project, Preset } from "@/lib/schemas";

export function AppSidebar() {
  const navigate = useNavigate();
  const { toggleSidebar } = useSidebar();
  const [projects, setProjects] = useState<Project[]>([]);
  const [presets, setPresets] = useState<Preset[]>([]);

  const fetchData = async () => {
    try {
      const [resProjects, resPresets] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/presets"),
      ]);
      if (resProjects.ok) {
        const data = await resProjects.json();
        setProjects(data.projects || []);
      }
      if (resPresets.ok) {
        const data = await resPresets.json();
        setPresets(data.presets || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Sidebar className="border-r border-zinc-200/50 dark:border-zinc-800/50 retro:border-fuchsia-500/50 retro:shadow-[0_0_15px_rgba(217,70,239,0.3)] bg-white/95 dark:bg-zinc-950/95 retro:bg-black/95 backdrop-blur-xl">
      <SidebarHeader className="p-4 border-b border-zinc-200/50 dark:border-zinc-800/50 retro:border-fuchsia-500/50 h-16 flex items-center justify-between flex-row">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
          <h2 className="font-bold whitespace-nowrap retro:text-cyan-400 retro:font-mono retro:uppercase tracking-widest text-lg">
            Tous les Projets
          </h2>
        </div>
        <PanelLeft 
          className="w-5 h-5 cursor-pointer text-zinc-600 dark:text-zinc-400 retro:text-cyan-400 hover:text-zinc-900 dark:hover:text-zinc-100 retro:hover:text-cyan-300 transition-colors" 
          onClick={toggleSidebar} 
        />
      </SidebarHeader>
      <SidebarContent className="scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider retro:text-fuchsia-500">
            Presets de lancement
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {presets.length === 0 && <span className="text-sm text-zinc-400 italic px-2">Aucun preset</span>}
              {presets.map((preset) => (
                <SidebarMenuItem key={preset.id}>
                  <SidebarMenuButton 
                    onClick={() => navigate("/settings")} 
                    className="flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl"
                  >
                    <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono">{preset.name}</span>
                    <Settings className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 retro:text-fuchsia-400 retro:group-hover:text-cyan-400 transition-colors shrink-0" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider retro:text-fuchsia-500 mt-4">
            Projets détectés
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length === 0 && <span className="text-sm text-zinc-400 italic px-2">Aucun projet</span>}
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton 
                    onClick={() => navigate("/settings")}
                    className="flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl"
                  >
                    <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono">{project.name}</span>
                    <Settings className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 retro:text-fuchsia-400 retro:group-hover:text-cyan-400 transition-colors shrink-0" />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
