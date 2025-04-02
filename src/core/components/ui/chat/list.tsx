import { cn } from "src/core/utils/components";

export const ChatMessageList = (props: React.ComponentProps<"div">) => (
    <div {...props} className={cn("flex flex-col gap-10", props.className)}>
        {props.children}
    </div>
);
