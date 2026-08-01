import { APITester } from "@/APITester";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import logo from "@/logo.svg";
import reactLogo from "@/react.svg";

export function HomePage() {
	return (
		<div className="container mx-auto p-8 text-center relative z-10">
			<div className="flex justify-center items-center gap-8 mb-8">
				<img
					src={logo}
					alt="Bun Logo"
					className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa] scale-120"
				/>
				<img
					src={reactLogo}
					alt="React Logo"
					className="h-36 p-6 transition-all duration-300 hover:drop-shadow-[0_0_2em_#61dafbaa] [animation:spin_20s_linear_infinite]"
				/>
			</div>
			<Card>
				<CardHeader className="gap-4">
					<CardTitle className="text-3xl font-bold">
						Bienvenue sur le projet EOS
					</CardTitle>
					<CardDescription>
						La configuration initiale est terminée.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<APITester />
				</CardContent>
			</Card>
		</div>
	);
}
