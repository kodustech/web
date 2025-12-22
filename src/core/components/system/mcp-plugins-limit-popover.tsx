"use client";

import { Button } from "@components/ui/button";
import { Link } from "@components/ui/link";
import { Popover, PopoverContent } from "@components/ui/popover";
import { ArrowRightIcon } from "lucide-react";
import { capturePosthogEvent } from "src/core/utils/posthog-client";

export const MCPPluginsLimitPopover = ({
    children,
    limit,
}: {
    limit: number;
    children: React.ReactNode;
}) => {
    return (
        <Popover>
            {children}

            <PopoverContent
                align="end"
                side="bottom"
                collisionPadding={32}
                className="flex flex-col gap-3 text-sm">
                <p>
                    You have reached the limit of{" "}
                    <span className="text-primary-light font-semibold">
                        {limit}
                    </span>{" "}
                    MCP Plugins for your current subscription plan.
                </p>

                <p>
                    Upgrade to{" "}
                    <span className="text-primary-light font-semibold">
                        unlock unlimited MCP Plugins
                    </span>
                    .
                </p>

                <Link href="/settings/subscription" className="mt-2 self-end">
                    <Button
                        decorative
                        size="xs"
                        variant="primary"
                        rightIcon={<ArrowRightIcon />}
                        onClick={() => {
                            capturePosthogEvent({
                                event: "upgrade_clicked",
                                properties: { feature: "mcp_plugins_limit" },
                            });
                        }}>
                        Upgrade plan
                    </Button>
                </Link>
            </PopoverContent>
        </Popover>
    );
};
