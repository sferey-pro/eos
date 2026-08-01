import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import "../styles/globals.css";

export function App() {
	return (
		<BrowserRouter>
			{/* Ici, on pourrait ajouter un composant <Header /> ou <Navbar /> partagé */}
			<Routes>
				<Route path="/" element={<HomePage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
