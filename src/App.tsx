import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { CleanPage } from "@/pages/CleanPage";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/AppSidebar";
import "../styles/globals.css";

export function App() {
	return (
		<BrowserRouter>
			<TooltipProvider>
				<SidebarProvider>
					<div className="flex w-full min-h-screen">
						<AppSidebar />
						<main className="flex-1 w-full relative">
							<Routes>
								<Route path="/" element={<HomePage />} />
								<Route path="/settings" element={<SettingsPage />} />
								<Route path="/containers" element={<PlaceholderPage />} />
								<Route path="/volumes" element={<PlaceholderPage />} />
								<Route path="/networks" element={<PlaceholderPage />} />
								<Route path="/terminal" element={<PlaceholderPage />} />
								<Route path="/metrics" element={<PlaceholderPage />} />
								<Route path="/clean" element={<CleanPage />} />
								<Route path="/proxy" element={<PlaceholderPage />} />
								<Route path="/theme" element={<PlaceholderPage />} />
								<Route path="/notifications" element={<PlaceholderPage />} />
							</Routes>
						</main>
					</div>
				</SidebarProvider>
			</TooltipProvider>
		</BrowserRouter>
	);
}

export default App;
