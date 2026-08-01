import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { SettingsPage } from "@/pages/SettingsPage";
import "../styles/globals.css";

export function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage />} />
				<Route path="/settings" element={<SettingsPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
