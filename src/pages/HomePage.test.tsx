import { describe, expect, test, mock, beforeEach } from "bun:test";
import { render, screen } from "@testing-library/react";
import { HomePage } from "./HomePage";

// Mock des dépendances pour ne pas avoir à instancier tout le réseau
mock.module("@/components/AddProjectModal", () => ({
	AddProjectModal: () => <div data-testid="mock-add-project-modal" />
}));

mock.module("@/components/AddAppModal", () => ({
	AddAppModal: () => <div data-testid="mock-add-app-modal" />
}));

mock.module("@/components/ThemeToggle", () => ({
	ThemeToggle: () => <div data-testid="mock-theme-toggle" />
}));

describe("HomePage", () => {
	beforeEach(() => {
		globalThis.fetch = mock(() => 
			Promise.resolve(new Response(JSON.stringify([])))
		) as any;
	});

	test("renders the homepage correctly", () => {
		render(<HomePage />);
		
		// Le titre de la page doit être présent
		expect(screen.getByText("EOS")).not.toBeNull();
		expect(screen.getByText(/Environment Operating System/i)).not.toBeNull();
	});
});
