import { DeepPartial } from "react-hook-form";

function isObject(item: unknown): item is Record<string, unknown> {
    return (
        item !== null &&
        item !== undefined &&
        typeof item === "object" &&
        !Array.isArray(item)
    );
}

export function deepMerge<T extends object>(...objects: T[]): T {
    if (objects.length === 0) {
        return {} as T;
    }

    const result: any = {};

    for (const source of objects) {
        if (!isObject(source)) {
            continue;
        }

        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const sourceValue = (source as any)[key];
                const resultValue = result[key];

                if (isObject(resultValue) && isObject(sourceValue)) {
                    result[key] = deepMerge(resultValue, sourceValue);
                } else {
                    result[key] = sourceValue;
                }
            }
        }
    }

    return result as T;
}

export function deepDifference<T extends object>(
    base: T,
    target: DeepPartial<T>,
): DeepPartial<T> {
    const result = {} as DeepPartial<T>;

    if (!isObject(target)) {
        return {} as DeepPartial<T>;
    }

    for (const key in target) {
        if (!Object.prototype.hasOwnProperty.call(target, key)) {
            continue;
        }

        const baseValue = base[key as keyof T];
        const targetValue = target[key as keyof DeepPartial<T>];

        if (Array.isArray(targetValue)) {
            if (JSON.stringify(baseValue) !== JSON.stringify(targetValue)) {
                result[key as keyof DeepPartial<T>] = targetValue;
            }
        } else if (isObject(targetValue) && isObject(baseValue)) {
            const nestedDiff = deepDifference(
                baseValue as object,
                targetValue as object,
            );
            if (Object.keys(nestedDiff).length > 0) {
                result[key as keyof DeepPartial<T>] = nestedDiff as any;
            }
        } else if ((baseValue as any) !== (targetValue as any)) {
            result[key as keyof DeepPartial<T>] = targetValue;
        }
    }
    return result;
}
