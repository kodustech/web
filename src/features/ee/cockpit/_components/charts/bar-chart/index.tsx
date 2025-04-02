import Chart from "react-google-charts";

// Função para formatar em dias, horas e minutos
const formatDaysHoursMinutes = (value: any) => {
    const days = Math.floor(value);
    const hours = Math.floor((value % 1) * 24);
    const minutes = Math.floor((((value % 1) * 24) % 1) * 60);
    return `${days}d ${hours}h ${minutes}m`;
};

// Função para formatar como porcentagem
const formatPercentage = (value: any) => {
    return `${(value * 100).toFixed(2)}%`;
};

// Função para não formatar
const formatNoFormatting = (value: any) => {
    return value.toString();
};

const formatMap: Record<string, (value: any) => string> = {
    leadTime: formatDaysHoursMinutes,
    leadTimeInWip: formatDaysHoursMinutes,
    throughput: formatNoFormatting,
    leadTimeForChange: formatDaysHoursMinutes,
    bugRatio: formatPercentage,
};

// Função para retornar o tooltip formatado como HTML
const formatTooltip = (value: any, formatter: (value: any) => string) => {
    const formattedValue = formatter(value);
    return `<div style="padding:5px; background-color: #ffffff; color: #000000; border-radius: 5px;">
                <strong>${formattedValue}</strong>
            </div>`;
};

// Função para processar os dados com base na formatação específica da métrica
const processData = (metricData: any, formatter: (value: any) => string) => {
    if (!metricData || metricData.length <= 0) {
        return [];
    }

    const processedData = [
        [
            "Date",
            "Value",
            { role: "annotation" },
            { role: "tooltip", type: "string", p: { html: true } },
        ],
    ];

    metricData.forEach((entry: any) => {
        const formattedValue = formatter(entry.value);
        processedData.push([
            entry.date,
            entry.value,
            formattedValue,
            formatTooltip(entry.value, formatter),
        ]);
    });

    return processedData;
};

export function BarChart({ metricData, metricName }: any) {
    // Determinar o formatter com base no nome da métrica
    const formatter = formatMap[metricName] || formatNoFormatting;
    const chartData = processData(metricData, formatter);

    if (!chartData || chartData.length <= 0) {
        return <></>;
    }

    const options: any = {
        chartArea: {
            width: "85%",
            height: "70%",
        },
        title: null,
        hAxis: {
            textStyle: { color: "#dfd8f5", fontSize: 11 },
            titleTextStyle: { color: "#dfd8f5" },
            gridlines: { color: "#3e3a52" },
            minorGridlines: { color: "#3e3a52" },
        },
        vAxis: {
            textStyle: { color: "#dfd8f5" },
            titleTextStyle: { color: "#dfd8f5" },
            gridlines: { color: "#2F2C3E" },
            minorGridlines: { color: "#2F2C3E" },
            format: metricName === "bugRatio" ? "percent" : null,
            ticks:
                metricName === "bugRatio"
                    ? [0, 0.25, 0.5, 0.75, 1].map((v) => ({
                          v,
                          f: formatPercentage(v),
                      }))
                    : null,
        },
        legend: { position: "none" }, // Esconder a legenda
        colors: ["#6a57a4"],
        backgroundColor: { fill: "transparent" },
        annotations: {
            alwaysOutside: true,
            textStyle: {
                fontSize: 12,
                color: "#ffffff",
                auraColor: "none",
                bold: true,
            },
            stem: {
                color: "none", // removes the stem line
            },
        },
        tooltip: { isHtml: true },
    };

    return (
        <Chart
            chartType="ColumnChart"
            width="100%"
            data={chartData}
            options={options}
        />
    );
}
