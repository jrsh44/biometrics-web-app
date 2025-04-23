import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  radius: number;
  value: number;
  diff: number;
}

interface IrisChartProps {
  chartData: ChartDataPoint[];
  irisRadiusIndex: number | null;
}

export const IrisChart: React.FC<IrisChartProps> = ({ chartData, irisRadiusIndex }) => {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h3 className="text-lg font-medium">
        Analiza zmiany wartości pikseli wraz ze wzrostem odległości od środka źrenicy
      </h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, left: 10, right: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="radius"
              label={{
                value: "Odległość od środka źreniy (piksele)",
                position: "insideBottomRight",
                offset: -10,
              }}
            />
            <Tooltip
              formatter={(value, name) => [
                `${value}`,
                name === "value" ? "Średnia wartość pikseli" : "Różnica intensywności",
              ]}
              labelFormatter={(radius) => `Promień: ${radius}px`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Średnia wartość pikseli"
              stroke="#4bc0c0"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={false}
              yAxisId="left"
            />
            <Line
              type="monotone"
              dataKey="diff"
              name="Różnica intensywności"
              stroke="#ff6384"
              strokeWidth={2}
              activeDot={{ r: 6 }}
              dot={false}
              yAxisId="right"
            />
            {irisRadiusIndex !== null && (
              <ReferenceLine
                x={chartData[irisRadiusIndex]?.radius}
                stroke="#00aaff"
                strokeWidth={2}
                label={{ value: "Granica tęczówki", position: "top" }}
                yAxisId="left"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
