import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { TerminalComponent } from "./TerminalComponent";

// Mock xterm
mock.module("xterm", () => {
	return {
		Terminal: class {
			loadAddon() {}
			open() {}
			write() {}
			clear() {}
			dispose() {}
		}
	};
});
mock.module("xterm-addon-fit", () => {
	return {
		FitAddon: class {
			fit() {}
		}
	};
});

describe("TerminalComponent", () => {
	afterEach(() => {
		cleanup();
		global.WebSocket = originalWebSocket;
	});

	let originalWebSocket: any;

	beforeEach(() => {
		originalWebSocket = global.WebSocket;
		global.WebSocket = class {
			onmessage = null;
			onclose = null;
			onerror = null;
			onopen = null;
			close() {}
			send() {}
		} as any;
	});

	test("renders without crashing", () => {
		const { container } = render(<TerminalComponent projectId="123" />);
		expect(container.firstChild).not.toBeNull();
	});
});
