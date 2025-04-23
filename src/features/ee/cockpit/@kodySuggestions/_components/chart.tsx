"use client";

import { VictoryLabel, VictoryPie } from "victory";

import type { getKodySuggestionsAnalytics } from "../../_services/analytics/productivity/fetch";

const [colorSent, colorImplemented] = ["#6D6DF8", "#19C26F"] as const;

export const Chart = ({
    data,
}: {
    data: Awaited<ReturnType<typeof getKodySuggestionsAnalytics>>;
}) => {
    return (
        <div className="flex gap-4">
            <div className="h-32 w-1/2">
                <VictoryPie
                    innerRadius={100}
                    labels={({ datum }) => `${datum.y}`}
                    colorScale={[colorSent, colorImplemented]}
                    data={[
                        { y: data.suggestionsSent },
                        { y: data.suggestionsImplemented },
                    ]}
                    labelComponent={
                        <VictoryLabel
                            lineHeight={1.25}
                            style={{
                                fontSize: 40,
                                fill: "var(--color-text-primary)",
                                fontFamily: "var(--font-sans)",
                            }}
                        />
                    }
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex gap-2.5">
                    <div
                        className="h-5 w-1.5 rounded-full"
                        style={{ backgroundColor: colorSent }}
                    />

                    <p className="text-text-secondary text-sm">Sent</p>
                </div>

                <div className="flex gap-2.5">
                    <div
                        className="h-5 w-1.5 rounded-full"
                        style={{ backgroundColor: colorImplemented }}
                    />

                    <p className="text-text-secondary text-sm">Implemented</p>
                </div>

                <div className="text-text-secondary mt-4 text-xs">
                    <p>Implementation Rate:</p>
                    <strong className="text-sm text-white">
                        {data.implementationRate * 100}%
                    </strong>
                </div>
            </div>
        </div>
    );
};
