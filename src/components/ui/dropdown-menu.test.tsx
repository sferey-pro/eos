import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup } from "./dropdown-menu";

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
			</DropdownMenu>
		);

		// Just check if trigger is rendered
		expect(screen.getByText("Open Dropdown")).not.toBeNull();
	});
});
