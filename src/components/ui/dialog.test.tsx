import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "./dialog";

describe("Dialog", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders and opens correctly", () => {
		render(
			<Dialog>
				<DialogTrigger>Open Dialog</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Dialog Title</DialogTitle>
						<DialogDescription>Dialog Description</DialogDescription>
					</DialogHeader>
					<div>Dialog Content</div>
					<DialogFooter>Footer</DialogFooter>
				</DialogContent>
			</Dialog>
		);

		const trigger = screen.getByText("Open Dialog");
		fireEvent.click(trigger);
		expect(screen.getByText("Dialog Title")).not.toBeNull();
	});
});
