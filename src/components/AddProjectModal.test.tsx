import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { AddProjectModal } from "./AddProjectModal";

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

const originalFetch = globalThis.fetch;

describe("AddProjectModal", () => {
	beforeEach(() => {
		globalThis.fetch = mock();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		cleanup();
	});

	test("scans and displays proposals", async () => {
		const mockFetch = globalThis.fetch as ReturnType<typeof mock>;
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					proposals: [
						{ name: "Test Project", type: "React", command: "npm start" },
					],
				}),
				{
					headers: { "Content-Type": "application/json" },
				},
			),
		);

		render(<AddProjectModal />);

		const addButton = screen.getByRole("button", { name: /ajouter/i });
		fireEvent.click(addButton);

		const input = await screen.findByPlaceholderText(/chemin absolu/i);
		fireEvent.change(input, { target: { value: "/home/user/project" } });

		fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

		const proposal = await screen.findByText("Test Project");
		expect(proposal).not.toBeNull();
	});

	test("saves selected proposals", async () => {
		const mockFetch = globalThis.fetch as ReturnType<typeof mock>;
		mockFetch.mockResolvedValueOnce(
			new Response(
				JSON.stringify({
					proposals: [
						{ name: "Test Project", type: "React", command: "npm start" },
					],
				}),
				{
					headers: { "Content-Type": "application/json" },
				},
			),
		);
		mockFetch.mockResolvedValueOnce(
			new Response(JSON.stringify({ success: true }), {
				headers: { "Content-Type": "application/json" },
			}),
		);

		render(<AddProjectModal />);

		// Open Modal
		fireEvent.click(screen.getByRole("button", { name: /ajouter/i }));

		const input = await screen.findByPlaceholderText(/chemin absolu/i);
		fireEvent.change(input, { target: { value: "/home/user/project" } });
		fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

		await screen.findByText("Test Project");

		// Select the proposal
		const checkbox = screen.getByRole("checkbox");
		fireEvent.click(checkbox);

		expect(checkbox.getAttribute("aria-checked")).toBe("true");

		// Save
		const saveButton = screen.getByRole("button", { name: /importer/i });
		fireEvent.click(saveButton);

		await waitFor(() => {
			expect(mockFetch).toHaveBeenCalledTimes(2);
		});

		expect(mockFetch.mock.calls[1][0]).toBe("/api/projects");
	});
});
