import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { PresetManagerModal } from "./PresetManagerModal";

const originalFetch = globalThis.fetch;

// Polyfills needed for Radix UI
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

describe("PresetManagerModal", () => {
	beforeEach(() => {
		globalThis.fetch = mock() as any;
		// mock scrollIntoView
		window.HTMLElement.prototype.scrollIntoView = () => {};
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		cleanup();
	});

	test("loads and displays presets", async () => {
		const mockFetch = globalThis.fetch as any;
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					presets: [{ id: "1", name: "Local Preset", projectIds: [] }],
					projects: [],
				}),
				{
					headers: { "Content-Type": "application/json" },
				},
			),
		);

		render(<PresetManagerModal />);

		fireEvent.click(screen.getByRole("button", { name: /manage presets/i }));

		const preset = await screen.findByText("Local Preset");
		expect(preset).not.toBeNull();
	});

	test("can create a new preset", async () => {
		const mockFetch = globalThis.fetch as any;
		// first fetch
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					presets: [],
					projects: [],
				}),
				{ headers: { "Content-Type": "application/json" } },
			),
		);
		// fetch POST new preset
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			}),
		);
		// fetch GET refetch
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					presets: [{ id: "2", name: "New Preset", projectIds: [] }],
					projects: [],
				}),
				{ headers: { "Content-Type": "application/json" } },
			),
		);

		render(<PresetManagerModal />);

		fireEvent.click(screen.getByRole("button", { name: /manage presets/i }));

		await screen.findByText("No presets found.");

		fireEvent.click(screen.getByRole("button", { name: /new preset/i }));

		await waitFor(() => {
			expect(mockFetch.mock.calls[1]?.[0]).toBe("/api/presets");
			expect(mockFetch.mock.calls[1]?.[1]?.method).toBe("POST");
		});
	});
});
