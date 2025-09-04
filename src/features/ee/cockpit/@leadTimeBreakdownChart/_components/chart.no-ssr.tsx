"use client";

import dynamic from "next/dynamic";
import type { AwaitedReturnType } from "src/core/types";

import type { getLeadTimeBreakdown } from "../../_services/analytics/productivity/fetch";
import Loading from "./loading";

const Chart = dynamic(() => import("./chart").then((c) => c.Chart), {
    ssr: false,
    loading: Loading,
});

export const ChartNoSSR = ({
    data,
}: {
    data: AwaitedReturnType<typeof getLeadTimeBreakdown>;
}) => {
    return <Chart data={data} />;
};
