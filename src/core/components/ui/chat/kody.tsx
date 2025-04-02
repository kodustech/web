import { cn } from "src/core/utils/components";

import { Avatar, AvatarFallback } from "../avatar";
import { Card, CardHeader } from "../card";
import { Icons } from "../icons";
import { SvgKody } from "../icons/SvgKody";

type Props = React.ComponentProps<"div"> & {
    loading?: boolean;
};

export const ChatKodyMessage = ({ loading, ...props }: Props) => (
    <div
        {...props}
        className={cn(
            "flex flex-row gap-4 self-start text-sm",
            props.className,
        )}>
        <Avatar>
            <AvatarFallback>
                <SvgKody />
            </AvatarFallback>
        </Avatar>

        <Card className="rounded-tl-none">
            {loading ? (
                <CardHeader className="py-5">
                    <Icons.spinner className="size-7 animate-spin stroke-brand-orange" />
                </CardHeader>
            ) : (
                <CardHeader>{props.children}</CardHeader>
            )}
        </Card>
    </div>
);
