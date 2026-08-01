import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectGroup } from "./select";

describe("Select", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders correctly", () => {
		render(
			<Select>
				<SelectTrigger>
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>Group</SelectLabel>
						<SelectItem value="1">Option 1</SelectItem>
						<SelectItem value="2">Option 2</SelectItem>
					</SelectGroup>
					<SelectSeparator />
				</SelectContent>
			</Select>
		);

		fireEvent.click(screen.getByText("Select an option"));
		expect(screen.getByText("Option 1")).not.toBeNull();
	});
});
