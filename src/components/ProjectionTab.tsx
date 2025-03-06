import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface IProjecttionTabProps {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export const ProjectionTab = (props: IProjecttionTabProps) => {
  const [horizontalProjection, setHorizontalProjection] = useState<number[]>([]);
  const [verticalProjection, setVerticalProjection] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const hProj = new Array(props.height).fill(0);
    const vProj = new Array(props.width).fill(0);

    for (let y = 0; y < props.height; y++) {
      for (let x = 0; x < props.width; x++) {
        const index = (y * props.width + x) * 4;
        const brightness = props.data[index] + props.data[index + 1] + props.data[index + 2];

        if (brightness < 500) {
          hProj[y]++;
          vProj[x]++;
        }
      }

      setHorizontalProjection(hProj);
      setVerticalProjection(vProj);
    }
  }, [props.data, props.width, props.height]);

  return (
    <div className="p-4">
      <canvas ref={canvasRef} className="hidden" />

      {props.data && (
        <div className="grid grid-cols-2 gap-4">
          <h3>Projekcja pozioma</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={horizontalProjection.map((value, index) => ({ index, value }))}>
              <XAxis dataKey="index" hide />
              <YAxis />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>

          <h3>Projekcja pionowa</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart
              layout="vertical"
              data={verticalProjection.map((value, index) => ({ index, value }))}
            >
              <XAxis />
              <YAxis dataKey="index" hide />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
