"use client";

import dynamic from "next/dynamic";

import type { getLeadTimeForChange } from "../../_services/analytics/productivity/fetch";
import Loading from "./loading";

const Chart = dynamic(() => import("./chart").then((c) => c.Chart), {
    ssr: false,
    loading: Loading,
});

export const ChartNoSSR = ({
    data,
}: {
    data: Awaited<ReturnType<typeof getLeadTimeForChange>>;
}) => {
    return <Chart data={data} />;
};
