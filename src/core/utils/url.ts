export const addSearchParamsToUrl = (
    url: string,
    params: Record<string, string | number | boolean | undefined | null> = {},
) => {
    const qIndex = url.indexOf("?");
    const path = qIndex === -1 ? url : url.substring(0, qIndex);
    const existingQuery = qIndex === -1 ? "" : url.substring(qIndex + 1);
    const searchParams = new URLSearchParams(existingQuery);

    for (const [k, v] of Object.entries(params)) {
        if (v === null || v === undefined) continue;
        const valueAsString = v.toString();
        if (!valueAsString.length) continue;
        searchParams.set(k, valueAsString);
    }

    const newQueryString = searchParams.toString();
    return newQueryString ? `${path}?${newQueryString}` : path;
};
