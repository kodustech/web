export const typedObjectKeys = <T extends object>(obj: T) =>
    Object.keys(obj ?? {}) as Array<keyof T>;

export const typedObjectValues = <T extends object>(obj: T) =>
    Object.values(obj ?? {}) as Array<T[keyof T]>;

export const typedObjectEntries = <T extends object>(obj: T) =>
    Object.entries(obj ?? {}) as Array<[keyof T, T[keyof T]]>;
