import { Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { typedObjectKeys } from "src/core/utils/object";

import { CODE_MANAGEMENT_PLATFORMS } from "../../_constants";
import { ProviderOptionButton } from "./option-button";

const typedProvidersArray = typedObjectKeys(CODE_MANAGEMENT_PLATFORMS);

export const GitProviders = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Connect a provider</CardTitle>
            </CardHeader>

            <CardContent className="flex gap-4">
                {typedProvidersArray.map((provider, index) => (
                    <Fragment key={provider}>
                        {index !== 0 && (
                            <Separator
                                orientation="vertical"
                                className="opacity-20"
                            />
                        )}

                        <ProviderOptionButton provider={provider} />
                    </Fragment>
                ))}
            </CardContent>
        </Card>
    );
};
