export const clamp = (
    value: number,
    props: {
        max?: number;
        min?: number;
    },
) => {
    let _value = value;
    if (props.min !== undefined) _value = Math.max(_value, props.min);
    if (props.max !== undefined) _value = Math.min(_value, props.max);
    return _value;
};
