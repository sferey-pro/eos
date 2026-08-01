/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ThemeProvider } from "./components/ThemeProvider";

const elem = document.getElementById("root");
if (!elem) throw new Error("Root element not found");

const app = (
	<StrictMode>
		<ThemeProvider defaultTheme="light">
			<App />
		</ThemeProvider>
	</StrictMode>
);

let root = (window as any).__REACT_ROOT__;
if (!root) {
	root = createRoot(elem);
	(window as any).__REACT_ROOT__ = root;
}
root.render(app);
