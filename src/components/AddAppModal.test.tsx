import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { AddAppModal } from "./AddAppModal";

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

const originalFetch = globalThis.fetch;

describe("AddAppModal", () => {
	beforeEach(() => {
		globalThis.fetch = mock() as any;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		cleanup();
	});

	test("opens modal and allows adding a new app", async () => {
		const mockFetch = globalThis.fetch as any;
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			}),
		);

		render(<AddAppModal />);

		fireEvent.click(screen.getByRole("button", { name: /ajouter/i }));

		const nameInput = await screen.findByPlaceholderText("ex: Aegis");
		fireEvent.change(nameInput, { target: { value: "My New App" } });

		const pathInput = await screen.findByPlaceholderText(
			"/absolute/path/to/app",
		);
		fireEvent.change(pathInput, { target: { value: "/home/app" } });

		const commandInput = await screen.findByPlaceholderText("ex: bun run dev");
		fireEvent.change(commandInput, { target: { value: "bun start" } });

		const saveButton = screen.getByRole("button", { name: /ajouter l'app/i });
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(mockFetch.mock.calls[0]?.[0]).toBe("/api/apps");
			expect(mockFetch.mock.calls[0]?.[1]?.method).toBe("POST");
		});
	});
});
