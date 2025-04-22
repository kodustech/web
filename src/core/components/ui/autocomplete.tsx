"use client";

import { createContext, use, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { cn } from "src/core/utils/components";

import { Badge } from "./badge";
import { Button } from "./button";
import { Input } from "./input";

type AutocompleteItem = {
    value: string;
    readonly?: boolean;
};

const AutocompleteContext = createContext<{
    value: Array<AutocompleteItem>;
    onValueChange: (value: Array<AutocompleteItem>) => void;
}>({} as any);

const AutocompleteRoot = ({
    value,
    onValueChange,
    ...props
}: React.ComponentProps<"div"> &
    React.ContextType<typeof AutocompleteContext>) => {
    return (
        <div
            {...props}
            className={cn(
                "ring-card-lv3 bg-card-lv2 rounded-xl ring-1",
                props.className,
            )}>
            <AutocompleteContext value={{ value, onValueChange }}>
                {props.children}
            </AutocompleteContext>
        </div>
    );
};

const AutocompleteInput = (props: React.ComponentProps<typeof Input>) => {
    const { value, onValueChange } = use(AutocompleteContext);
    const ref = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState("");

    return (
        <Input
            {...props}
            ref={ref}
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className={cn("ring-0", props.className)}
            onKeyUp={async (event) => {
                if (event.key !== "Enter") return;
                // at this time, Enter key was pressed
                event.preventDefault();

                const trimmedInputValue = inputValue.trim();

                if (trimmedInputValue.length) {
                    const foundItem = value.find(
                        (item) => item.value === trimmedInputValue,
                    );

                    if (!foundItem) {
                        onValueChange([
                            ...value,
                            {
                                value: trimmedInputValue,
                                readonly: false,
                            },
                        ]);
                    }
                }

                setInputValue("");
                ref.current?.focus();
            }}
            rightIcon={
                inputValue.length ? (
                    <Button
                        variant="helper"
                        size="icon-sm"
                        className="-mr-2"
                        onClick={() => {
                            setInputValue("");
                            ref.current?.focus();
                        }}>
                        <XIcon className="size-4!" />
                    </Button>
                ) : null
            }
        />
    );
};

const AutocompleteList = (props: React.ComponentProps<"div">) => {
    const { value, onValueChange } = use(AutocompleteContext);

    return (
        <div {...props} className="my-2 flex flex-wrap gap-1 px-4">
            {value.map((item) => (
                <Badge
                    active
                    size="sm"
                    variant="helper"
                    key={item.value}
                    className="gap-1 py-0">
                    <div>{item.value}</div>

                    {!item.readonly && (
                        <Button
                            variant="helper"
                            size="icon-xs"
                            onClick={() => {
                                onValueChange([
                                    ...value.filter(
                                        (eachItem) =>
                                            eachItem.value !== item.value,
                                    ),
                                ]);
                            }}
                            className={cn(
                                "text-destructive -mr-3",
                                props.className,
                            )}>
                            <XIcon />
                        </Button>
                    )}
                </Badge>
            ))}
        </div>
    );
};

export const Autocomplete = {
    Root: AutocompleteRoot,
    Input: AutocompleteInput,
    List: AutocompleteList,
};

export type { AutocompleteItem };
