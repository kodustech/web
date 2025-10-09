export const ArrayHelpers = {
    sortAlphabetically<T>(array: T[], propName: keyof T) {
        return [...array].sort((a, b) => {
            if (a[propName] > b[propName]) return 1;
            if (a[propName] < b[propName]) return -1;
            return 0;
        });
    },
};
