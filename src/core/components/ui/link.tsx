"use client";

import NextLink from "next/link";
import { cn } from "src/core/utils/components";

export const Link = ({
    disabled,
    ...props
}: React.ComponentProps<typeof NextLink> & { disabled?: boolean }) => {
    return (
        <NextLink
            {...props}
            tabIndex={disabled ? -1 : 0}
            {...(disabled && { "data-disabled": true })}
            href={disabled ? "#" : props.href}
            onClick={(e) => {
                if (disabled) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }

                props.onClick?.(e);
            }}
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
