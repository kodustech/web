import { cn } from "src/core/utils/components";

import { Avatar, AvatarFallback } from "../avatar";
import { Card, CardHeader } from "../card";

export const ChatUserMessage = (props: React.ComponentProps<"div">) => (
    <div
        {...props}
        className={cn("flex flex-row gap-4 self-end text-sm", props.className)}>
        <Card className="rounded-tr-none">
            <CardHeader>{props.children}</CardHeader>
        </Card>

        <Avatar>
            <AvatarFallback>Me</AvatarFallback>
        </Avatar>
    </div>
);
