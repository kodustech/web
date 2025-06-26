import { cn } from "src/core/utils/components";

export const Keycap = (props: React.ComponentProps<"kbd">) => {
    return (
        <kbd
            {...props}
            className={cn(
                "text-background mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-sm px-1.5 text-xs leading-px font-bold -tracking-widest select-none",
                "bg-[linear-gradient(-225deg,rgb(233,236,239)_0%,rgb(255,255,255)_100%)]",
                "shadow-[inset_0_-2px_0_0_rgb(151,157,168),inset_0_0_1px_1px_#ffffff,0_1px_2px_1px_rgba(0,0,0,1)]",
                props.className,
            )}
        />
    );
};
