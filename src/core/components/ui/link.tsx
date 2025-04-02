import NextLink from "next/link";
import { cn } from "src/core/utils/components";

export const Link = (
    props: React.ComponentProps<typeof NextLink> & { disabled?: boolean },
) => {
    return (
        <NextLink
            {...props}
            tabIndex={0}
            onClick={props.disabled ? undefined : props.onClick}
            className={cn(
                "cursor-pointer text-sm underline underline-offset-4 transition-colors focus-visible:text-brand-orange hover:text-brand-orange hover:underline",
                props.disabled && "text-muted-foreground",
                props.className,
            )}
        />
    );
};
