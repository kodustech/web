export const addSearchParamsToUrl = (
    route: string,
    params: Record<string, string | number | boolean | undefined | null> = {},
) => {
    let url = route;
    const searchParams = new URLSearchParams();

    for (const [k, v] of Object.entries(params)) {
        if (v === null || v === undefined) continue;
        const valueAsString = v.toString();
        if (!valueAsString.length) continue;
        searchParams.set(k, valueAsString);
    }

    if (searchParams.size) return `${url}?${searchParams.toString()}`;
    return url;
};
