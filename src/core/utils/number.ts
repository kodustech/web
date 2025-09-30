export const clamp = (
    value: number,
    props: {
        max?: number;
        min?: number;
    },
) => {
    if (props.min !== undefined) value = Math.max(value, props.min);
    if (props.max !== undefined) value = Math.min(value, props.max);
    return value;
};
