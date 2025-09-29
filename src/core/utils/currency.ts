export const CurrencyHelpers = {
    format: ({
        amount,
        currency,
        maximumFractionDigits,
    }: {
        amount: number;
        currency: string;
        maximumFractionDigits?: number;
    }) => {
        return new Intl.NumberFormat(undefined, {
            currency,
            style: "currency",
            maximumFractionDigits,
        }).format(amount);
    },
};
