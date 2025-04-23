import { useEffect, useState } from "react";
import { Card, CardContent } from "@components/ui/card";
import { Heading } from "@components/ui/heading";
import { Switch } from "@components/ui/switch";
import { arrayMoveImmutable } from "array-move";
import { GripVertical } from "lucide-react";
import SortableList, { SortableItem, SortableKnob } from "react-easy-sort";

export interface CheckinSection {
    id: string;
    name: string;
    description: string;
    active: boolean;
    order: number;
}

export interface CheckinSelectedSession {
    id: string;
    active: boolean;
    order: number;
}

interface SectionProps {
    options: CheckinSection[];
    defaultValue?: CheckinSelectedSession[];
    onChange?: (
        values: { id: string; active: boolean; order: number }[],
    ) => void;
}

const SortableCheckinSessionsList: React.FC<SectionProps> = ({
    options,
    defaultValue,
    onChange,
}) => {
    const [sortedOptions, setSortedOptions] =
        useState<CheckinSection[]>(options);

    useEffect(() => {
        setSortedOptions(options);
    }, [options]);

    useEffect(() => {
        const updatedOptions = sortedOptions.map((item) => ({
            ...item,
            active:
                defaultValue?.find((section) => section.id === item.id)
                    ?.active ?? false,
            order:
                defaultValue?.find((section) => section.id === item.id)
                    ?.order ?? 0,
        }));

        setSortedOptions(updatedOptions);
    }, [defaultValue]);

    const onSortEnd = (oldIndex: number, newIndex: number) => {
        const newSortedOptions = arrayMoveImmutable(
            sortedOptions,
            oldIndex,
            newIndex,
        );

        const updatedOptions = newSortedOptions.map((item, index) => ({
            ...item,
            order: index + 1,
        }));

        setSortedOptions(updatedOptions);

        if (onChange) {
            onChange(
                updatedOptions.map((item) => ({
                    id: item.id,
                    active: item.active,
                    order: item.order,
                })),
            );
        }
    };

    const switchSection = (id: string) => {
        const updatedOptions = sortedOptions.map((item) =>
            item.id === id ? { ...item, active: !item.active } : item,
        );

        setSortedOptions(updatedOptions);

        if (onChange) {
            onChange(
                updatedOptions.map((item) => ({
                    id: item.id,
                    active: item.active,
                    order: item.order,
                })),
            );
        }
    };

    const orderedOptions = sortedOptions.sort((a, b) => a.order - b.order);

    return (
        <SortableList onSortEnd={onSortEnd} className="flex flex-col gap-1.5">
            {orderedOptions.map((item) => (
                <SortableItem key={item.id}>
                    <Card>
                        <CardContent className="flex flex-row items-center gap-4 py-4">
                            <SortableKnob>
                                <GripVertical className="cursor-n-resize" />
                            </SortableKnob>

                            <Switch
                                checked={item.active}
                                onCheckedChange={() => switchSection(item.id)}
                            />

                            <div className="flex flex-col gap-1">
                                <Heading variant="h3">{item.name}</Heading>

                                <span className="text-text-secondary text-sm">
                                    {item.description}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </SortableItem>
            ))}
        </SortableList>
    );
};

export default SortableCheckinSessionsList;
