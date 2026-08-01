import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive retro:font-mono retro:uppercase retro:tracking-wider retro:border retro:border-transparent",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90 retro:bg-cyan-500/10 retro:border-cyan-400/80 retro:text-cyan-400 retro:hover:bg-cyan-400/20 retro:hover:text-cyan-200 retro:hover:shadow-[0_0_15px_rgba(34,211,238,0.6)] retro:shadow-[0_0_10px_rgba(34,211,238,0.2)]",
				destructive:
					"bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60 retro:bg-rose-500/10 retro:border-rose-500/80 retro:text-rose-400 retro:hover:bg-rose-500/20 retro:hover:text-rose-200 retro:hover:shadow-[0_0_15px_rgba(244,63,94,0.6)] retro:shadow-[0_0_10px_rgba(244,63,94,0.2)]",
				outline:
					"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 retro:bg-black/50 retro:border-fuchsia-500/70 retro:text-fuchsia-400 retro:hover:bg-fuchsia-500/20 retro:hover:border-fuchsia-400 retro:hover:text-fuchsia-200 retro:hover:shadow-[0_0_15px_rgba(217,70,239,0.5)]",
				secondary:
					"bg-secondary text-secondary-foreground hover:bg-secondary/80 retro:bg-purple-500/10 retro:border-purple-500/50 retro:text-purple-400 retro:hover:bg-purple-500/20 retro:hover:text-purple-200 retro:hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]",
				ghost:
					"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 retro:text-cyan-500 retro:hover:bg-cyan-500/20 retro:hover:text-cyan-300 retro:hover:border-cyan-500/50 retro:hover:shadow-[0_0_10px_rgba(34,211,238,0.4)]",
				link: "text-primary underline-offset-4 hover:underline retro:text-fuchsia-400 retro:hover:text-fuchsia-300 retro:hover:drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]",
			},
			size: {
				default: "h-9 px-4 py-2 has-[>svg]:px-3",
				sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
				lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
				icon: "size-9",
				"icon-sm": "size-8",
				"icon-lg": "size-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

function Button({
	className,
	variant,
	size,
	asChild = false,
	...props
}: React.ComponentProps<"button"> &
	VariantProps<typeof buttonVariants> & {
		asChild?: boolean;
	}) {
	const Comp = asChild ? Slot : "button";

	return (
		<Comp
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
