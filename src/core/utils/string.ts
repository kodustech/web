export const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const pluralize = (
    number: number,
    params: { singular: string; plural: string },
) => {
    return number === 1 ? params.singular : params.plural;
};
