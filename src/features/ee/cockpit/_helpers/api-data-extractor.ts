/**
 * Helper function to extract actual data from API responses
 * Handles both direct data responses and wrapped {status, data} responses
 */
export const extractApiData = <T>(
    response: T | { status: string; data: T },
): T => {
    if (response && typeof response === "object" && "data" in response) {
        return (response as { status: string; data: T }).data;
    }
    return response as T;
};
