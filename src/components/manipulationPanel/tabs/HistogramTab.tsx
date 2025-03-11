import { useState, useEffect, useRef } from "react";
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Bar, BarChart } from "recharts";

type THistogramData = {
  bin: number;
  red: number;
  green: number;
  blue: number;
}[];

interface IHistogramTabProps {
  data: Uint8ClampedArray;
}

export const HistogramTab = (prosp: IHistogramTabProps) => {
  const [histogramData, setHistogramData] = useState<THistogramData>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const redHist = new Array(256).fill(0);
    const greenHist = new Array(256).fill(0);
    const blueHist = new Array(256).fill(0);

    for (let i = 0; i < prosp.data.length; i += 4) {
      const r = prosp.data[i];
      const g = prosp.data[i + 1];
      const b = prosp.data[i + 2];

      redHist[r]++;
      greenHist[g]++;
      blueHist[b]++;
    }

    const histData = redHist.map((_, i) => ({
      bin: i,
      red: redHist[i],
      green: greenHist[i],
      blue: blueHist[i],
    }));

    setHistogramData(histData);
  }, [prosp.data]);

  return (
    <div className="flex flex-col items-center  pt-4">
      <canvas ref={canvasRef} className="hidden" />
      <div className="w-full">
        <h2 className="text-center text-lg font-semibold pb-4">Histogram RGB</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={histogramData}>
            <XAxis dataKey="bin" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="red" fill="red" />
            <Bar dataKey="green" fill="green" />
            <Bar dataKey="blue" fill="blue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
