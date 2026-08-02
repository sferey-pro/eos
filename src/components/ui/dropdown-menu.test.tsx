import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		render(
			<DropdownMenu>
				<DropdownMenuTrigger>Open Dropdown</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuLabel>Label</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>Item 1</DropdownMenuItem>
					<DropdownMenuCheckboxItem checked>Item 2</DropdownMenuCheckboxItem>
					<DropdownMenuRadioGroup value="1">
						<DropdownMenuRadioItem value="1">Item 3</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</DropdownMenu>,
		);

		// Just check if trigger is rendered
		expect(screen.getByText("Open Dropdown")).not.toBeNull();
	});
});
