import { useState } from "react";

interface IFilterProps {
  label: string;
  onFilterApply: (kernel: number[][]) => void;
  defaultKernel: number[][];
}

export const Filter = (props: IFilterProps) => {
  const [kernel, setKernel] = useState<number[][]>(props.defaultKernel);

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        className="flex w-full justify-center border-2 p-4 text-slate-200 border-gray-600 hover:border-slate-200 transition-all cursor-pointer"
        onClick={() => props.onFilterApply(kernel)}
      >
        {props.label}
      </button>
      <div className={`grid grid-cols-${kernel[0].length} col-span-full border-collapse`}>
        {kernel.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <input
              key={`${rowIndex}-${colIndex}`}
              className={`self-center text-center border border-gray-600 ${
                rowIndex === 0 ? "border-t-0" : ""
              } ${colIndex === 0 ? "border-l-0" : ""} ${
                rowIndex === kernel.length - 1 ? "border-b-0" : ""
              } ${colIndex === row.length - 1 ? "border-r-0" : ""}`}
              type="number"
              value={value}
              onChange={(e) => {
                const newKernel = [...kernel];
                newKernel[rowIndex][colIndex] = Number(e.target.value);
                setKernel(newKernel);
              }}
            />
          )),
        )}
      </div>
    </div>
  );
};
