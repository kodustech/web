import { analyticsFetch } from "./utils";

export const getAnalyticsStatus = () => {
    return analyticsFetch<{
        hasData: boolean;
        pullRequestsCount: number;
    }>("/cockpit/validate");
};
