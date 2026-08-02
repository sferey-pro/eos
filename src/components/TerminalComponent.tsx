import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useTheme } from "@/components/ThemeProvider";

interface TerminalComponentProps {
	projectId: string | null;
}

export function TerminalComponent({ projectId }: TerminalComponentProps) {
	const terminalRef = useRef<HTMLDivElement>(null);
	const termInstance = useRef<Terminal | null>(null);
	const fitAddon = useRef<FitAddon | null>(null);
	const ws = useRef<WebSocket | null>(null);
	const { theme } = useTheme();

	useEffect(() => {
		if (!terminalRef.current) return;

		const isRetro = theme === "retro";

		let isDisposed = false;

		termInstance.current = new Terminal({
			theme: {
				background: "transparent",
				// The terminal container is always dark (#0a0a0b), so text must always be light
				foreground: isRetro ? "#22d3ee" : "#e4e4e7",
				cursor: isRetro ? "#f43f5e" : "#e4e4e7",
				black: "#52525b",
				red: "#ef4444",
				green: "#22c55e",
				yellow: "#eab308",
				blue: "#3b82f6",
				magenta: "#d946ef",
				cyan: "#06b6d4",
				white: "#f4f4f5",
				brightBlack: "#71717a",
				brightRed: "#f87171",
				brightGreen: "#4ade80",
				brightYellow: "#fde047",
				brightBlue: "#60a5fa",
				brightMagenta: "#e879f9",
				brightCyan: "#22d3ee",
				brightWhite: "#ffffff",
			},
			fontFamily: '"JetBrains Mono", "Fira Code", monospace',
			fontSize: 13,
			cursorBlink: true,
			disableStdin: true, // Read-only logs
			convertEol: true,
		});

		fitAddon.current = new FitAddon();
		termInstance.current.loadAddon(fitAddon.current);

		// Use ResizeObserver to only open and fit when container has dimensions
		const resizeObserver = new ResizeObserver(() => {
			if (isDisposed || !terminalRef.current) return;
			const { clientWidth, clientHeight } = terminalRef.current;

			if (clientWidth > 0 && clientHeight > 0) {
				try {
					if (!termInstance.current?.element) {
						termInstance.current?.open(terminalRef.current);
					}
					// Only fit if the core is ready
					if (termInstance.current?.element) {
						fitAddon.current?.fit();
					}
				} catch (e) {
					console.warn("Xterm fit error:", e);
				}
			}
		});

		resizeObserver.observe(terminalRef.current);

		return () => {
			isDisposed = true;
			resizeObserver.disconnect();
			termInstance.current?.dispose();
		};
	}, [theme]);

	useEffect(() => {
		if (!projectId || !termInstance.current) return;

		termInstance.current.clear();
		termInstance.current.write(
			`\x1b[36mConnecting to logs for project ${projectId}...\x1b[0m\r\n`,
		);

		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
		const wsUrl = `${protocol}//${window.location.host}/ws/logs?id=${projectId}`;

		ws.current = new WebSocket(wsUrl);

		ws.current.onmessage = (event) => {
			termInstance.current?.write(event.data);
		};

		ws.current.onclose = () => {
			termInstance.current?.write(
				`\r\n\x1b[31m[Disconnected from log stream]\x1b[0m\r\n`,
			);
		};

		return () => {
			if (ws.current) {
				ws.current.close();
			}
		};
	}, [projectId]);

	return (
		<div
			role="log"
			aria-label="Terminal de sortie"
			className="w-full h-full relative"
			ref={terminalRef}
		></div>
	);
}
