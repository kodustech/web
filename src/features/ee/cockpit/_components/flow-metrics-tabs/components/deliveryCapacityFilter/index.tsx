import { RadioGroup } from "@radix-ui/themes";
import { NewItemsFrom } from "@services/metrics/types";

import styles from "./styles.module.css";

interface IDeliveryCapacityFilterProps {
    newItemsFrom: NewItemsFrom;
    handleFilterDeliverCapacityMetric: (value: NewItemsFrom) => Promise<void>;
}

export function DeliveryCapacityFilter({
    newItemsFrom,
    handleFilterDeliverCapacityMetric,
}: IDeliveryCapacityFilterProps) {
    return (
        <div className="flex flex-col gap-6">
            <RadioGroup.Root
                value={newItemsFrom}
                onValueChange={handleFilterDeliverCapacityMetric}>
                <div className="flex flex-row gap-2">
                    <RadioGroup.Item
                        value={NewItemsFrom.TODO_COLUMN}
                        className={`${styles.filterStyleCard} ${newItemsFrom === NewItemsFrom.TODO_COLUMN ? styles.filterStyleCardSelected : ""} flex w-64 flex-col justify-between pb-4`}>
                        <div>
                            <h3 className="text-sm font-bold">To do</h3>
                            <span className="text-gray-400 text-xs">
                                Count "new items" as items added to the "To do"
                                column.
                            </span>
                        </div>
                    </RadioGroup.Item>
                    <RadioGroup.Item
                        value={NewItemsFrom.CREATION_DATE}
                        className={`${styles.filterStyleCard} ${newItemsFrom === NewItemsFrom.CREATION_DATE ? styles.filterStyleCardSelected : ""} flex w-64 flex-col justify-between pb-4`}>
                        <div>
                            <h3 className="text-sm font-bold">Creation date</h3>
                            <span className="text-gray-400 text-xs">
                                Filter "new items" by creation date.
                            </span>
                        </div>
                    </RadioGroup.Item>
                </div>
            </RadioGroup.Root>
        </div>
    );
}
