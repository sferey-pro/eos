import { Moon, Sun, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon" className="shrink-0 relative">
					<Sun
						aria-hidden="true"
						className={`h-[1.2rem] w-[1.2rem] transition-all ${theme === "retro" ? "scale-0" : "rotate-0 scale-100 dark:-rotate-90 dark:scale-0"}`}
					/>
					<Moon
						aria-hidden="true"
						className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1.2rem] w-[1.2rem] transition-all ${theme === "retro" ? "scale-0" : "rotate-90 scale-0 dark:rotate-0 dark:scale-100"}`}
					/>
					<Terminal
						aria-hidden="true"
						className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[1.2rem] w-[1.2rem] transition-all ${theme === "retro" ? "scale-100 rotate-0" : "scale-0 rotate-90"}`}
					/>
					<span className="sr-only">Changer le thème</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme("light")}>
					Clair
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("dark")}>
					Sombre
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("retro")}>
					Retro 👾
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme("system")}>
					Système
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
