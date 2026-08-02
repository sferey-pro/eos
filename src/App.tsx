import { HomePage } from "@/pages/HomePage";
import { ThemeToggle } from "@/components/ThemeToggle";
import "../styles/globals.css";

export function App() {
	return (
		<div className="flex w-full min-h-screen">
			<main className="flex-1 w-full relative">
				<HomePage />
				<div className="fixed bottom-6 right-6 z-50">
					<ThemeToggle />
				</div>
			</main>
		</div>
	);
}

export default App;
