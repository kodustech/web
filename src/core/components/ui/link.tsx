"use client";

import NextLink from "next/link";
import { cn } from "src/core/utils/components";

export const Link = ({
    disabled,
    ...props
}: React.ComponentProps<typeof NextLink> & { disabled?: boolean }) => {
    if (disabled) {
        return (
            <div data-disabled className="group/link contents">
                {props.children}
            </div>
        );
    }

    return (
        <NextLink
            {...props}
            className={cn(
                "group/link",
                "w-fit underline-offset-5 transition",
                "text-primary-light",
                "link-hover:underline",
                "link-focused:underline",
                "link-disabled:text-inherit",
                props.className,
            )}
        />
    );
};
