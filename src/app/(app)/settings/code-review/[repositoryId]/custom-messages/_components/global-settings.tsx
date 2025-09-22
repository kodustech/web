"use client";

import { Button } from "@components/ui/button";
import { Card, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Switch } from "@components/ui/switch";

export const GlobalSettings = (props: {
    hideComments: boolean;
    onHideCommentsChangeAction: (value: boolean) => void;
    canEdit: boolean;
}) => {
    return (
        <div className="flex flex-col gap-4">
            <Button
                size="sm"
                variant="helper"
                className="w-full"
                disabled={!props.canEdit}
                onClick={() => props.onHideCommentsChangeAction(!props.hideComments)}>
                <CardHeader className="flex flex-row items-center justify-between gap-6 p-4">
                    <div>
                        <Heading variant="h3">
                            Post as hidden comment
                            <span className="ml-1.5 inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                GitHub only
                            </span>
                        </Heading>
                        <p className="text-text-secondary">
                            When enabled, all review messages will be posted as hidden/minimized comments.
                        </p>
                    </div>
                    <Switch
                        decorative
                        checked={props.hideComments}
                    />
                </CardHeader>
            </Button>
        </div>
    );
};
