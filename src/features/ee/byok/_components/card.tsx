import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { FormControl } from "@components/ui/form-control";
import { magicModal } from "@components/ui/magic-modal";
import { Separator } from "@components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@components/ui/tooltip";
import { HelpCircleIcon, PencilIcon, PlusIcon } from "lucide-react";

import type { BYOKConfig } from "../_types";
import { BYOKEditKeyModal } from "./_modals/edit-key";

export const BYOKCard = ({
    type,
    config,
    onSave,
    onDelete,
    tooltip,
}: {
    type: "main" | "fallback";
    config: BYOKConfig | undefined;
    onSave: (_: BYOKConfig) => Promise<void>;
    onDelete: () => Promise<void>;
    tooltip: React.JSX.Element;
}) => {
    return (
        <Card color="lv1" className="min-h-40 flex-1">
            <CardHeader className="flex-row justify-between">
                <div className="flex items-center">
                    <CardTitle className="capitalize">
                        {type}{" "}
                        {type === "fallback" && (
                            <small className="text-text-tertiary font-normal lowercase">
                                (optional)
                            </small>
                        )}
                    </CardTitle>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="cancel"
                                size="icon-xs"
                                className="text-primary-light">
                                <HelpCircleIcon />
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent>{tooltip}</TooltipContent>
                    </Tooltip>
                </div>

                <Button
                    size="xs"
                    variant="primary-dark"
                    leftIcon={!config ? <PlusIcon /> : <PencilIcon />}
                    onClick={() =>
                        magicModal.show(() => (
                            <BYOKEditKeyModal
                                type={type}
                                config={config}
                                onSave={onSave}
                                onDelete={onDelete}
                            />
                        ))
                    }>
                    {!config ? "Add" : "Edit"}
                </Button>
            </CardHeader>

            <CardContent>
                {!config ? <ConfigNotSet /> : <ConfigTable config={config} />}
            </CardContent>
        </Card>
    );
};

const ConfigNotSet = () => (
    <div className="flex h-full items-center justify-center pb-4">
        <span className="text-text-secondary self-center text-center text-sm">
            Key not set
        </span>
    </div>
);

const ConfigTable = ({ config }: { config: BYOKConfig }) => (
    <>
        <FormControl.Root className="flex flex-row justify-between">
            <FormControl.Label>Provider</FormControl.Label>
            <FormControl.Input>
                <span className="text-text-secondary text-sm">
                    {config?.provider}
                </span>
            </FormControl.Input>
        </FormControl.Root>

        <Separator className="bg-card-lv2 my-2" />

        <FormControl.Root className="flex flex-row justify-between">
            <FormControl.Label>Model</FormControl.Label>
            <FormControl.Input>
                <span className="text-text-secondary text-sm">
                    {config?.model}
                </span>
            </FormControl.Input>
        </FormControl.Root>

        <Separator className="bg-card-lv2 my-2" />

        <FormControl.Root className="flex flex-row justify-between">
            <FormControl.Label>Key</FormControl.Label>
            <FormControl.Input>
                <span className="text-text-secondary text-sm">
                    {config?.apiKey}
                </span>
            </FormControl.Input>
        </FormControl.Root>

        {config.baseURL && (
            <>
                <Separator className="bg-card-lv2 my-2" />

                <FormControl.Root className="flex flex-row justify-between">
                    <FormControl.Label>Base URL</FormControl.Label>
                    <FormControl.Input>
                        <span className="text-text-secondary text-sm">
                            {config?.baseURL}
                        </span>
                    </FormControl.Input>
                </FormControl.Root>
            </>
        )}
    </>
);
