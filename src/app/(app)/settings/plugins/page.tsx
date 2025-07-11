import { Avatar, AvatarImage } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@components/ui/card";
import { Link } from "@components/ui/link";
import { Page } from "@components/ui/page";
import { getMCPPlugins } from "@services/mcp-manager/fetch";
import { CheckIcon } from "lucide-react";

export default async function PluginsPage() {
    const plugins = await getMCPPlugins();
    const alphabeticallySortedPlugins = plugins.sort((a, b) =>
        a.name > b.name ? 1 : -1,
    );

    return (
        <Page.Root>
            <Page.Header>
                <Page.TitleContainer>
                    <Page.Title>Plugins</Page.Title>

                    <Page.Description>
                        Connect Kody to external tools and APIs to enhance your
                        code reviews with real-world context
                    </Page.Description>
                </Page.TitleContainer>
            </Page.Header>

            <Page.Content>
                <div className="grid grid-cols-2 gap-2">
                    {alphabeticallySortedPlugins.map((item) => (
                        <Link
                            key={item.id}
                            className="w-full"
                            disabled={
                                item.isConnected &&
                                item.connectionStatus === "ACTIVE"
                            }
                            href={`/settings/plugins/${item.id}`}>
                            <Button
                                size="lg"
                                decorative
                                variant="helper"
                                className="w-full items-start gap-0 px-0 py-0">
                                <Card className="flex w-full gap-0 bg-transparent shadow-none">
                                    <CardHeader className="gap-4">
                                        <div className="flex h-fit flex-row items-center gap-5">
                                            <Avatar className="bg-card-lv3 group-disabled/link:bg-card-lv3/50 size-10 rounded-lg p-1">
                                                <AvatarImage src={item.logo} />
                                            </Avatar>

                                            <div className="flex-1">
                                                <CardTitle className="text-text-primary capitalize">
                                                    {item.appName}
                                                </CardTitle>

                                                <span className="text-text-tertiary text-xs">
                                                    @{item.provider}
                                                </span>
                                            </div>

                                            {item.isConnected &&
                                                item.connectionStatus ===
                                                    "ACTIVE" && (
                                                    <Badge
                                                        variant="tertiary"
                                                        leftIcon={<CheckIcon />}
                                                        className="bg-success! text-card-lv2! pointer-events-none">
                                                        Installed
                                                    </Badge>
                                                )}
                                        </div>

                                        {item.description && (
                                            <CardDescription className="text-sm">
                                                {item.description}
                                            </CardDescription>
                                        )}
                                    </CardHeader>
                                </Card>
                            </Button>
                        </Link>
                    ))}
                </div>
            </Page.Content>
        </Page.Root>
    );
}
