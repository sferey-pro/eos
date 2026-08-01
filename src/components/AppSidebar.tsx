import { Settings, Box, Grid2x2, LayoutDashboard, FolderSearch, Database, Network, Container, TerminalSquare, Activity, Trash2, Globe, Paintbrush, Bell } from "lucide-react";
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
import { AddProjectModal } from "./AddProjectModal";
import { useTheme } from "./ThemeProvider";

export function AppSidebar() {
  const navigate = useNavigate();
  const { theme } = useTheme();
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
      <SidebarHeader className="border-b border-zinc-200/50 dark:border-zinc-800/50 retro:border-fuchsia-500/50 flex flex-col justify-center h-16 px-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" onClick={() => navigate("/")} className="hover:bg-transparent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 retro:bg-black/50 border border-zinc-200 dark:border-zinc-800 retro:border-cyan-500/50 retro:shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                {theme === 'retro' ? (
                  <img src="/eos-logo-retro.jpg" alt="EOS Logo Retro" className="w-5 h-5 rounded-sm object-cover" />
                ) : (
                  <img src="/eos-logo.jpg" alt="EOS Logo" className="w-5 h-5 rounded-sm object-cover" />
                )}
              </div>
              <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden truncate">
                <span className="font-black retro:text-transparent retro:bg-clip-text retro:bg-gradient-to-r retro:from-cyan-400 retro:to-fuchsia-500 retro:font-mono retro:uppercase tracking-widest text-xl retro:drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">
                  EOS
                </span>
                <span className="text-[10px] font-medium text-zinc-500 retro:text-cyan-600/80 uppercase tracking-widest truncate">
                  Environment Operating System
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider retro:text-fuchsia-500 group-data-[collapsible=icon]:hidden">
            Navigation Globale
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/")}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                >
                  <LayoutDashboard className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                  <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Tableau de bord</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/settings")}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                >
                  <Settings className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                  <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Configuration</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <AddProjectModal trigger={
                  <SidebarMenuButton 
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full cursor-pointer"
                  >
                    <FolderSearch className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                    <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Dépôts & Scans</span>
                  </SidebarMenuButton>
                } />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider retro:text-fuchsia-500 mt-2 group-data-[collapsible=icon]:hidden">
            Infrastructure & Conteneurs
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/containers")}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                >
                  <Container className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                  <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Conteneurs Actifs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/volumes")}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                >
                  <Database className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                  <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Volumes & BDD</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/networks")}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                >
                  <Network className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                  <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Réseaux</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider retro:text-fuchsia-500 mt-2 group-data-[collapsible=icon]:hidden">
            Monitoring & Observabilité
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/terminal")}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                >
                  <TerminalSquare className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                  <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Terminal Global</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/metrics")}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                >
                  <Activity className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                  <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Performances</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider retro:text-fuchsia-500 mt-2 group-data-[collapsible=icon]:hidden">
            Outils Rapides
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/clean")}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                >
                  <Trash2 className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                  <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Nettoyage Système</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/proxy")}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                >
                  <Globe className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                  <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Reverse Proxy</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider retro:text-fuchsia-500 mt-2 group-data-[collapsible=icon]:hidden">
            Préférences de l'Interface
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/theme")}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                >
                  <Paintbrush className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                  <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Personnalisation</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate("/notifications")}
                  className="hover:bg-zinc-100 dark:hover:bg-zinc-800 retro:hover:bg-fuchsia-950/30 transition-colors group retro:hover:border-cyan-400/50 border border-transparent rounded-xl flex items-center gap-3 w-full"
                >
                  <Bell className="w-4 h-4 text-zinc-500 retro:text-cyan-400 shrink-0" />
                  <span className="font-medium text-sm truncate retro:text-cyan-300 retro:font-mono flex-1 text-left">Notifications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider retro:text-fuchsia-500 mt-2 group-data-[collapsible=icon]:hidden">
            Presets de lancement
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {presets.length === 0 && <span className="text-sm text-zinc-400 italic px-2 group-data-[collapsible=icon]:hidden">Aucun preset</span>}
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
          <SidebarGroupLabel className="text-xs font-semibold text-zinc-500 uppercase tracking-wider retro:text-fuchsia-500 mt-4 group-data-[collapsible=icon]:hidden">
            Projets détectés
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects.length === 0 && <span className="text-sm text-zinc-400 italic px-2 group-data-[collapsible=icon]:hidden">Aucun projet</span>}
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
