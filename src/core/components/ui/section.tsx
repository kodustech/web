import { cn } from "src/core/utils/components";

import { Heading } from "./heading";

const SectionRoot = (props: React.ComponentProps<"div">) => (
    <div {...props} className={cn("flex flex-col gap-2", props.className)}>
        {props.children}
    </div>
);

const SectionContent = (props: React.ComponentProps<"div">) => (
    <div {...props} className={cn("flex flex-col gap-6", props.className)}>
        {props.children}
    </div>
);

const SectionHeader = (props: React.ComponentProps<"div">) => (
    <div
        {...props}
        className={cn(
            "flex items-center justify-between gap-6",
            props.className,
        )}>
        {props.children}
    </div>
);

const SectionHeaderActions = (props: React.ComponentProps<"div">) => (
    <div
        {...props}
        className={cn(
            "flex items-center justify-between gap-6",
            props.className,
        )}>
        {props.children}
    </div>
);

const SectionTitle = (props: React.ComponentProps<"div">) => (
    <Heading variant="h3" {...props} />
);

const SectionDescription = (props: React.ComponentProps<"div">) => (
    <span className="text-sm text-muted-foreground">{props.children}</span>
);

export const Section = {
    Root: SectionRoot,
    Title: SectionTitle,
    Header: SectionHeader,
    HeaderActions: SectionHeaderActions,
    Content: SectionContent,
    Description: SectionDescription,
};
