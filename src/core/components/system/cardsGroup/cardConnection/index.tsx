import React, { useCallback } from "react";
import { Heading } from "@components/ui/heading";
import { Button } from "src/core/components/ui/button";
import { Card, CardFooter, CardHeader } from "src/core/components/ui/card";
import { SvgCheck } from "src/core/components/ui/icons/SvgCheck";
import { INTEGRATIONS_KEY } from "src/core/enums";

type CardProps = {
    svg: React.ReactNode;
    title: string;
    isSetupComplete: boolean;
    disabled?: boolean;
    integrationKey: any;
    connectIntegration: (title: string, serviceType?: string) => void;
    editIntegration: (title: string) => void;
};

export default function CardConnection({
    isSetupComplete = false,
    disabled = false,
    svg,
    title,
    integrationKey,
    connectIntegration,
    editIntegration,
}: CardProps): React.ReactNode {
    const [buttonTopText, setButtonsTopText] = React.useState<string>("");
    const [isDisabled, setIsDisabled] = React.useState<boolean>(false);

    const getTopText = useCallback(
        (githubVerification: any) => {
            if (title.toLowerCase() === INTEGRATIONS_KEY.GITHUB) {
                if (githubVerification?.config?.status === "PENDING") {
                    return "Pending";
                } else if (
                    !githubVerification?.config?.hasRepositories &&
                    githubVerification?.hasConnection
                ) {
                    return "Add repositories";
                } else {
                    return "Connect";
                }
            } else {
                return "Connect";
            }
        },
        [title],
    );

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-4">
                {svg}
                <Heading variant="h2">{title}</Heading>
            </CardHeader>

            <CardFooter className="flex flex-row items-end justify-between">
                {isSetupComplete ? (
                    <div className="flex items-center gap-2 text-sm">
                        <SvgCheck className="h-5 w-5" />
                        <span className="text-success">Connected</span>
                    </div>
                ) : (
                    <Button
                        onClick={() => connectIntegration(title)}
                        disabled={isSetupComplete}>
                        {buttonTopText}
                    </Button>
                )}

                {isSetupComplete && (
                    <Button
                        disabled={disabled || isDisabled}
                        style={{
                            pointerEvents: undefined,
                        }}
                        onClick={() => editIntegration(title)}>
                        {isSetupComplete ? "Edit" : "Connect"}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
