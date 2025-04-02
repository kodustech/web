import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { cn } from "src/core/utils/components";

import { buttonVariants } from "./button";
import { Card } from "./card";
import { Checkbox } from "./checkbox";

interface CheckboxCardProps {
    value?: Record<string, boolean>;
    onChange?: (values: NonNullable<CheckboxCardProps["value"]>) => void;
}

const options = [
    { value: "mon", name: "Mon" },
    { value: "tue", name: "Tue" },
    { value: "wed", name: "Wed" },
    { value: "thu", name: "Thu" },
    { value: "fri", name: "Fri" },
    { value: "sat", name: "Sat" },
    { value: "sun", name: "Sun" },
] satisfies Array<{
    value: string;
    name: string;
}>;

const CheckboxCard = ({ value = {}, onChange }: CheckboxCardProps) => {
    const selectedOptions = options.reduce(
        (acc, option) => {
            acc[option.value] = value[option.value] ?? false;
            return acc;
        },
        {} as Record<string, boolean>,
    );

    return (
        <ToggleGroup.Root
            type="multiple"
            className="grid grid-cols-7 gap-2"
            value={Object.entries(selectedOptions)
                .filter(([, isSelected]) => isSelected)
                .map(([value]) => value)}
            onValueChange={(values) => {
                onChange?.({
                    // get all options and set them to false
                    ...Object.fromEntries(
                        Object.keys(value).map((value) => [value, false]),
                    ),

                    // then, set only selected options to true
                    ...Object.fromEntries(values.map((value) => [value, true])),
                });
            }}>
            {options.map((option) => (
                <ToggleGroup.ToggleGroupItem
                    asChild
                    key={option.value}
                    value={option.value}>
                    <Card
                        className={cn(
                            buttonVariants({ variant: "outline" }),
                            "h-auto cursor-pointer items-start px-5 py-4",
                        )}>
                        <div className="flex h-full w-full items-start justify-between">
                            <span>{option.name}</span>

                            <Checkbox
                                disabled
                                className="pointer-events-none children:opacity-100 disabled:opacity-100"
                                checked={selectedOptions[option.value]}
                            />
                        </div>
                    </Card>
                </ToggleGroup.ToggleGroupItem>
            ))}
        </ToggleGroup.Root>
    );
};

export default CheckboxCard;
