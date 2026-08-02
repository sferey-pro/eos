import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./accordion";

describe("Accordion", () => {
	afterEach(() => {
		cleanup();
	});

	test("renders and toggles correctly", () => {
		render(
			<Accordion type="single" collapsible>
				<AccordionItem value="item-1">
					<AccordionTrigger>Trigger 1</AccordionTrigger>
					<AccordionContent>Content 1</AccordionContent>
				</AccordionItem>
			</Accordion>,
		);

		expect(screen.getByText("Trigger 1")).not.toBeNull();
		const trigger = screen.getByText("Trigger 1");
		fireEvent.click(trigger);
		expect(screen.getByText("Content 1")).not.toBeNull();
	});
});
