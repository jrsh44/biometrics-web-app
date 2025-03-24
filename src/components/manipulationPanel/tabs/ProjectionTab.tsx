import { useState, useEffect, useRef } from "react";
import { XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { applyGrayscale } from "../../../utils/manipulate";

type TChartData = { x: number; value: number };

interface IProjecttionTabProps {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export const ProjectionTab = (props: IProjecttionTabProps) => {
  const [horizontalData, setHorizontalData] = useState<TChartData[]>([]);
  const [verticalData, setVerticalData] = useState<TChartData[]>([]);
  const canvasRef = useRef(null);

  useEffect(() => {
    const horizontalProjection = new Array(props.height).fill(0);
    const verticalProjection = new Array(props.width).fill(0);

    for (let y = 0; y < props.height; y++) {
      for (let x = 0; x < props.width; x++) {
        const index = (y * props.width + x) * 4;
        const pixelValue = applyGrayscale(
          props.data[index],
          props.data[index + 1],
          props.data[index + 2],
        )[0];

        horizontalProjection[y] += pixelValue;
        verticalProjection[x] += pixelValue;
      }
    }

    setHorizontalData(horizontalProjection.map((value, index) => ({ x: index, value })));
    setVerticalData(verticalProjection.map((value, index) => ({ x: index, value })));
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 pt-4">
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="w-full">
        <h2 className="text-center text-lg font-semibold pb-4">Projekcja Pozioma</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={horizontalData} layout="vertical">
            <XAxis type="number" tick={false} />
            <YAxis dataKey="x" type="number" />
            <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full">
        <h2 className="text-center text-lg font-semibold pb-4">Projekcja Pionowa</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={verticalData}>
            <XAxis dataKey="x" type="number" tickCount={4} />
            <YAxis type="number" tick={false} />
            <Line type="monotone" dataKey="value" stroke="#82ca9d" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
