import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./dialog";

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
			</Dialog>,
		);

		const trigger = screen.getByText("Open Dialog");
		fireEvent.click(trigger);
		expect(screen.getByText("Dialog Title")).not.toBeNull();
	});
});
