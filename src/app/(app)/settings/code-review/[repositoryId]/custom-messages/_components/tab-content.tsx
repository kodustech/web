"use client";

import { Button } from "@components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { Card, CardHeader } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Label } from "@components/ui/label";
import { Markdown } from "@components/ui/markdown";
import { Switch } from "@components/ui/switch";
import { Textarea } from "@components/ui/textarea";
import { CustomMessageConfig } from "@services/pull-request-messages/types";
import { RuleType } from "markdown-to-jsx";
import { useDefaultCodeReviewConfig } from "src/app/(app)/settings/_components/context";
import { useCurrentConfigLevel } from "src/app/(app)/settings/_hooks";
import { FormattedConfigLevel } from "../../../_types";
import { useSuspenseParentPullRequestMessages } from "@services/pull-request-messages/hooks";

import { OverrideIndicator } from "../../../_components/override";
import { FormattedConfig } from "../../../_types";
import { CustomMessagesOptionsDropdown } from "./dropdown";
import { ChevronDownIcon } from "lucide-react";
import { dropdownItems, VARIABLE_REGEX } from "./options";

export const TabContent = (props: {
    type: "startReviewMessage" | "endReviewMessage";
    value: FormattedConfig<CustomMessageConfig["startReviewMessage"]>;
    initialState: FormattedConfig<CustomMessageConfig["startReviewMessage"]>;
    onChangeAction: (value: CustomMessageConfig["startReviewMessage"]) => void;
    canEdit: boolean;
}) => {
    const defaults = useDefaultCodeReviewConfig()?.customMessages;
    const currentLevel = useCurrentConfigLevel();
    const hasParent = currentLevel !== FormattedConfigLevel.GLOBAL;
    const isGlobalScope = currentLevel === FormattedConfigLevel.GLOBAL;
    const parentMessages = useSuspenseParentPullRequestMessages();
    const inheritedContentTarget = hasParent
        ? (props.type === "startReviewMessage"
              ? parentMessages.startReviewMessage.content.value
              : parentMessages.endReviewMessage.content.value)
        : undefined;

    const defaultContentTarget =
        props.type === "startReviewMessage"
            ? defaults?.startReviewMessage?.content ?? ""
            : defaults?.endReviewMessage?.content ?? "";

    const currentContent = props.value.content.value ?? "";

    return (
        <div className="flex flex-1 flex-col gap-4">
            <Button
                size="sm"
                variant="helper"
                className="w-full"
                disabled={!props.canEdit}
                onClick={() =>
                    props.onChangeAction({
                        content: props.value.content.value,
                        status:
                            props.value.status.value === "active"
                                ? "inactive"
                                : "active",
                    })
                }>
                <CardHeader className="flex flex-row items-center justify-between gap-6 p-4">
                    <div>
                        <Heading variant="h3">
                            Enable{" "}
                            {props.type === "startReviewMessage"
                                ? "Start"
                                : "End"}{" "}
                            Review message
                        </Heading>
                        <OverrideIndicator
                            currentValue={props.value.status.value}
                            initialState={props.initialState.status}
                        />
                        <p className="text-text-secondary">
                            If disabled, Kody won't send any message at the{" "}
                            {props.type === "startReviewMessage"
                                ? "start"
                                : "end"}{" "}
                            of the review.
                        </p>
                    </div>
                    <Switch
                        decorative
                        checked={props.value.status.value === "active"}
                    />
                </CardHeader>
            </Button>

            <div className="mt-4 flex flex-1">
                <div className="flex flex-2 shrink-0 flex-col gap-2">
                    <div className="flex h-7 items-center gap-2">
                        <Label htmlFor="custom-message">Custom message</Label>

                        <CustomMessagesOptionsDropdown
                            value={props.value}
                            onChange={props.onChangeAction}
                            canEdit={props.canEdit}
                        />

                        <OverrideIndicator
                            currentValue={props.value.content.value}
                            initialState={props.initialState.content}
                        />
                    </div>

                    <Card color="lv3" className="flex-1 rounded-r-none">
                        <CardHeader className="h-full p-0 *:h-full">
                            <Textarea
                                value={props.value.content.value}
                                id="custom-message"
                                placeholder="Write your custom message here..."
                                className="h-full resize-none rounded-none bg-transparent p-6"
                                disabled={
                                    !props.canEdit ||
                                    props.value.status.value === "inactive"
                                }
                                onChange={(ev) =>
                                    props.onChangeAction({
                                        content: ev.target.value,
                                        status: props.value.status.value,
                                    })
                                }
                            />
                        </CardHeader>
                    </Card>
                </div>

                <div className="flex flex-3 shrink-0 flex-col gap-2">
                    <div className="flex h-7 items-center justify-between">
                        <Label>Preview</Label>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    size="xs"
                                    variant="cancel"
                                    rightIcon={<ChevronDownIcon className="-mr-1" />}
                                    className="text-tertiary-light min-h-auto self-end"
                                    disabled={!props.canEdit}>
                                    Reset to…
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {hasParent && (
                                    <DropdownMenuItem
                                        disabled={
                                            !props.canEdit ||
                                            inheritedContentTarget === undefined ||
                                            currentContent.trim() ===
                                                (inheritedContentTarget || "")
                                                    .trim()
                                        }
                                        onClick={() => {
                                            if (inheritedContentTarget === undefined)
                                                return;
                                            props.onChangeAction({
                                                status: props.value.status.value,
                                                content: inheritedContentTarget,
                                            });
                                        }}>
                                        <div>
                                            Inherited message
                                            <p className="text-text-tertiary text-xs">
                                                Restore content from parent scope
                                            </p>
                                        </div>
                                    </DropdownMenuItem>
                                )}
                                {isGlobalScope && (
                                    <DropdownMenuItem
                                        disabled={
                                            !props.canEdit ||
                                            currentContent.trim() ===
                                                (defaultContentTarget || "")
                                                    .trim()
                                        }
                                        onClick={() => {
                                            props.onChangeAction({
                                                status: props.value.status.value,
                                                content: defaultContentTarget,
                                            });
                                        }}>
                                        <div>
                                            Default message
                                            <p className="text-text-tertiary text-xs">
                                                Restore platform default content
                                            </p>
                                        </div>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Card className="flex-1 rounded-l-none">
                        <CardHeader className="h-full">
                            <Markdown
                                options={{
                                    renderRule: (next, node) => {
                                        if (node.type !== RuleType.text)
                                            return next();

                                        const regex =
                                            node.text.match(VARIABLE_REGEX);

                                        if (regex) {
                                            const key = regex[0]?.replace(
                                                "@",
                                                "",
                                            ) as keyof typeof dropdownItems;

                                            if (!dropdownItems[key])
                                                return next();

                                            return (
                                                <span key={key}>
                                                    {
                                                        dropdownItems[key]
                                                            ?.example
                                                    }
                                                </span>
                                            );
                                        }

                                        return next();
                                    },
                                }}>
                                {props.value.content.value}
                            </Markdown>

                            <div className="flex h-full items-center justify-center">
                                {props.value.content.value.trim().length ===
                                    0 && (
                                    <p className="text-text-secondary text-sm">
                                        No content to preview
                                    </p>
                                )}
                            </div>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </div>
    );
};
