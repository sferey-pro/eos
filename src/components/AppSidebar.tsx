import { Settings, PanelLeft, Box, Grid2x2 } from "lucide-react";
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
    <Sidebar collapsible="icon" className="border-r border-zinc-200/50 dark:border-zinc-800/50 retro:border-fuchsia-500/50 retro:shadow-[0_0_15px_rgba(217,70,239,0.3)] bg-white/95 dark:bg-zinc-950/95 retro:bg-black/95 backdrop-blur-xl">
      <SidebarHeader className="border-b border-zinc-200/50 dark:border-zinc-800/50 retro:border-fuchsia-500/50 flex flex-col justify-center h-16">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={() => navigate("/")} className="hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-900 text-white retro:bg-cyan-500 retro:text-black retro:shadow-[0_0_10px_#00ffff]">
                <PanelLeft className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold retro:text-cyan-400 retro:font-mono retro:uppercase tracking-widest text-lg">Projets</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
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
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                  >
                    <Grid2x2 className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                    <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">{preset.name}</span>
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
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                  >
                    <Box className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                    <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">{project.name}</span>
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
