import { useState } from "react";
import { Button } from "./Buttons";

export interface IFilterProps {
  label: string;
  onFilterApply: (kernels: number[][][]) => void;
  defaultKernels: number[][][];
  kernelsDescription?: string[];
  hideKernels?: boolean;
}

export const Filter = (props: IFilterProps) => {
  const [kernels, setKernels] = useState<number[][][]>(props.defaultKernels);

  const handleKernelChange = (
    kernelIndex: number,
    rowIndex: number,
    colIndex: number,
    value: number,
  ) => {
    const newKernels = kernels.map((kernel, kIndex) =>
      kIndex === kernelIndex
        ? kernel.map((row, rIndex) =>
            rIndex === rowIndex
              ? row.map((col, cIndex) => (cIndex === colIndex ? value : col))
              : row,
          )
        : kernel,
    );
    setKernels(newKernels);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button label={props.label} onClick={() => props.onFilterApply(kernels)} />

      {!props.hideKernels &&
        kernels.map((kernel, kernelIndex) => (
          <div key={`kernel-${kernelIndex}`} className="flex flex-col items-center gap-2">
            {props.kernelsDescription && props.kernelsDescription[kernelIndex] && (
              <p className="text-center font-semibold">{props.kernelsDescription[kernelIndex]}</p>
            )}
            <div
              className={"grid border-collapse col-span-full"}
              style={{
                gridTemplateColumns: `repeat(${kernel[0].length}, minmax(0, 1fr))`,
              }}
            >
              {kernel.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <input
                    key={`kernel-${kernelIndex}-${rowIndex}-${colIndex}`}
                    className={`self-center text-center border border-gray-600 p-1 
                    ${rowIndex === 0 ? "border-t-0" : ""} 
                    ${colIndex === 0 ? "border-l-0" : ""} 
                    ${rowIndex === kernel.length - 1 ? "border-b-0" : ""} 
                    ${colIndex === row.length - 1 ? "border-r-0" : ""}`}
                    type="number"
                    step="any"
                    value={value}
                    onChange={(e) =>
                      handleKernelChange(kernelIndex, rowIndex, colIndex, Number(e.target.value))
                    }
                  />
                )),
              )}
            </div>
          </div>
        ))}
    </div>
  );
};
