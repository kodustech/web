import Chart from "react-google-charts";

// Funções de formatação
const formatDaysHoursMinutes = (value: any) => {
    const days = Math.floor(value);
    const hours = Math.floor((value % 1) * 24);
    const minutes = Math.floor((((value % 1) * 24) % 1) * 60);
    return `${days}d ${hours}h ${minutes}m`;
};

const formatPercentage = (value: any) => {
    return `${(value * 100).toFixed(2)}%`;
};

const formatNoFormatting = (value: any) => {
    if (value) {
        return value.toString();
    }
};

// Mapa de formatação por métrica
const formatMap: Record<string, (value: any) => string> = {
    leadTime: formatDaysHoursMinutes,
    leadTimeInWip: formatDaysHoursMinutes,
    throughput: formatNoFormatting,
    bugRatio: formatPercentage,
};

// Função para processar os dados com base na formatação específica da métrica
const processData = (metricData: any, formatter: (value: any) => string) => {
    if (!metricData || metricData.length <= 0) {
        return [];
    }

    const teamNames = Object.keys(metricData[0].teams);
    const includeAverage = teamNames.length > 1;
    const processedData = [["Date", ...teamNames]];

    if (includeAverage) {
        processedData[0].push("Media");
    }

    metricData.forEach((entry: any) => {
        const { date, teams } = entry;
        const teamValues = teamNames.map((team) => teams[team]);
        if (includeAverage) {
            const media =
                teamValues.reduce((sum, value) => sum + value, 0) /
                teamValues.length;
            processedData.push([date, ...teamValues, media]);
        } else {
            processedData.push([date, ...teamValues]);
        }
    });

    return processedData;
};

// Função para formatar os dados, incluindo tooltips
const getFormattedData = (data: any, formatter: (value: any) => string) => {
    return data.map((row: any, index: any) => {
        if (index === 0) return row;
        return row.map((cell: any, cellIndex: any) => {
            if (cellIndex === 0) return cell;
            return { v: cell, f: formatter(cell) };
        });
    });
};

export function LineChart({ metricData, metricName }: any) {
    const formatter = formatMap[metricName] || formatNoFormatting;
    const chartData = processData(metricData, formatter);
    const formattedData = getFormattedData(chartData, formatter);

    if (!chartData || chartData.length <= 0) {
        return <></>;
    }

    const includeAverage = chartData[0].length > 2;

    const options: any = {
        chartArea: {
            width: "80%",
            height: "80%",
        },
        title: null,
        hAxis: {
            title: null,
            textStyle: { color: "#dfd8f5" },
            titleTextStyle: { color: "#dfd8f5" },
            gridlines: { color: "#3e3a52" },
            minorGridlines: { color: "#3e3a52" },
        },
        vAxis: {
            title: null,
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
        legend: { textStyle: { color: "#dfd8f5" } },
        colors: [
            "#6a57a4",
            "#f59220",
            "#ef4c4b",
            "#9c85b6",
            "#f5b77f",
            "#f78c85",
            "#524e7a",
            "#b38866",
            "#a93038",
            "#804d9c",
            "#c1c1c1", // Cor para a linha de média
        ],
        backgroundColor: { fill: "transparent" },
        series: includeAverage
            ? {
                  [chartData[0].length - 2]: {
                      lineDashStyle: [4, 4],
                      color: "#c1c1c1",
                  },
              }
            : {},
        tooltip: {
            isHtml: true,
            textStyle: { color: "black" },
            trigger: "focus",
        },
    };

    return (
        <Chart
            chartType="LineChart"
            width="100%"
            data={formattedData}
            options={options}
        />
    );
}
