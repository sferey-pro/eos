import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

// Polyfills needed for Radix UI with happy-dom
if (typeof window.PointerEvent === "undefined") {
	class PointerEvent extends Event {
		button: number;
		ctrlKey: boolean;
		constructor(type: string, props: any) {
			super(type, props);
			this.button = props?.button || 0;
			this.ctrlKey = props?.ctrlKey || false;
		}
	}
	window.PointerEvent = PointerEvent as any;
}
if (typeof window.HTMLElement.prototype.hasPointerCapture === "undefined") {
	window.HTMLElement.prototype.hasPointerCapture = () => false;
	window.HTMLElement.prototype.setPointerCapture = () => {};
	window.HTMLElement.prototype.releasePointerCapture = () => {};
}
if (typeof window.ResizeObserver === "undefined") {
	class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
	window.ResizeObserver = ResizeObserver as any;
}

describe("ThemeToggle", () => {
	beforeEach(() => {
		document.documentElement.className = "";
		localStorage.clear();

		// Mock matchMedia
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: (query: string) => ({
				matches: false,
				media: query,
				onchange: null,
				addListener: () => {},
				removeListener: () => {},
				addEventListener: () => {},
				removeEventListener: () => {},
				dispatchEvent: () => false,
			}),
		});
	});

	afterEach(() => {
		cleanup();
	});

	test("toggles theme to dark", async () => {
		render(
			<ThemeProvider>
				<ThemeToggle />
			</ThemeProvider>,
		);

		const button = screen.getByRole("button", { name: /changer le thème/i });
		fireEvent.pointerDown(button);

		const darkMenuItem = await screen.findByText("Sombre");
		fireEvent.click(darkMenuItem);

		expect(document.documentElement.classList.contains("dark")).toBe(true);
	});

	test("toggles theme to light", async () => {
		render(
			<ThemeProvider defaultTheme="dark">
				<ThemeToggle />
			</ThemeProvider>,
		);
		expect(document.documentElement.classList.contains("dark")).toBe(true);

		const button = screen.getByRole("button", { name: /changer le thème/i });
		fireEvent.pointerDown(button);

		const lightMenuItem = await screen.findByText("Clair");
		fireEvent.click(lightMenuItem);

		expect(document.documentElement.classList.contains("light")).toBe(true);
	});
});
