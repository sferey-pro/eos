import { describe, expect, test, mock, beforeEach, afterEach } from "bun:test";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import { HomePage } from "./HomePage";

// Mock des dépendances pour ne pas avoir à instancier tout le réseau
mock.module("@/components/AddProjectModal", () => ({
	AddProjectModal: ({ trigger }: any) => <div data-testid="mock-add-project-modal">{trigger}</div>
}));

mock.module("@/components/AddAppModal", () => ({
	AddAppModal: ({ children }: any) => <div data-testid="mock-add-app-modal">{children}</div>
}));

mock.module("@/components/PresetManagerModal", () => ({
	PresetManagerModal: ({ trigger }: any) => <div data-testid="mock-preset-manager-modal">{trigger}</div>
}));

mock.module("@/components/TerminalComponent", () => ({
	TerminalComponent: () => <div data-testid="mock-terminal" />
}));

const originalFetch = globalThis.fetch;

describe("HomePage", () => {
	beforeEach(() => {
		globalThis.fetch = mock(() => 
			Promise.resolve(new Response(JSON.stringify({
				projects: [],
				presets: [],
				apps: []
			})))
		) as any;
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		cleanup();
	});

	test("renders the homepage correctly when empty", async () => {
		render(<HomePage />);
		expect(await screen.findByText("Environment Operating System")).toBeTruthy();
	});

	test("renders the homepage correctly", () => {
		render(<HomePage />);
		
		// Le titre de la page doit être présent
		expect(screen.getByText("Environment Operating System")).toBeTruthy();
		expect(screen.getByText(/Environment Operating System/i)).not.toBeNull();
	});
});
