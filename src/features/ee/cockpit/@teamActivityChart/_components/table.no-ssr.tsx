"use client";

import dynamic from "next/dynamic";

const DataTable = dynamic(
    () => import("./data-table").then((c) => c.DataTable),
    { ssr: false },
);

export const TableNoSSR = ({
    data,
    startDate,
    endDate,
}: {
    data: [string, { date: string; commitCount: number; prCount: number }[]][];
    startDate: string;
    endDate: string;
}) => {
    return <DataTable data={data} startDate={startDate} endDate={endDate} />;
};
