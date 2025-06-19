"use client";

import dynamic from "next/dynamic";
import { Spinner } from "@components/ui/spinner";

import type { getPRsByDeveloper } from "../../_services/analytics/productivity/fetch";

const Chart = dynamic(() => import("./chart").then((c) => c.Chart), {
    ssr: false,
    loading: () => <Spinner />,
});

export const ChartNoSSR = ({
    data,
}: {
    data: Awaited<ReturnType<typeof getPRsByDeveloper>>;
}) => {
    return <Chart data={data} />;
};
