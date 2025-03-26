import { useEffect, useRef, useState, useCallback } from "react";
import {
  applyGrayscale,
  applyBrightness,
  applyContrast,
  applyNegative,
  applyBinarization,
} from "../../utils/manipulate";
import {
  applyCannyFilter,
  applyDirectionalFilter,
  applyWeightedMeanFilter,
} from "../../utils/filter";
import { Tabs } from "../ui/Tabs";
import { BasicToolsTab } from "./tabs/BasicToolsTab";
import { FiltersTab } from "./tabs/FiltersTab";
import { TImage, useImage } from "../../utils/useImage";
import { ButtonDelete, ButtonDownload, ButtonReset } from "../ui/Buttons";
import { IFilterProps } from "../ui/Filter";
import { HistogramTab } from "./tabs/HistogramTab";
import { ProjectionTab } from "./tabs/ProjectionTab";
import {
  defaultAverageKernel,
  defaultGaussianKernel,
  defaultSharpenKernel,
  defaultRobertsCrossKernelX,
  defaultRobertsCrossKernelY,
  defaultSobelKernelX,
  defaultSobelKernelY,
} from "../../consts/kernels";

interface IManipulationPanelProps {
  image: TImage;
}

export const ManipulationPanel = (props: IManipulationPanelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedData, setProcessedData] = useState<Uint8ClampedArray>(props.image.data);
  const {
    changeBrightness,
    changeContrast,
    changeGrayscale,
    changeNegative,
    changeThreshold,
    applyFilter,
    removeImage,
    revertImage,
  } = useImage();

  useEffect(() => {
    if (props.image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        canvas.width = props.image.width;
        canvas.height = props.image.height;
        ctx.putImageData(
          new ImageData(props.image.data, props.image.width, props.image.height),
          0,
          0,
        );
        applyFilters(ctx, props.image.width, props.image.height);
      }
    }
  }, [props.image]);

  const applyFilters = useCallback(
    (ctx: CanvasRenderingContext2D | null, width: number, height: number) => {
      if (!ctx) return;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        if (props.image.isGrayscale) {
          [r, g, b] = applyGrayscale(r, g, b);
        }

        if (props.image.brightness !== null) {
          [r, g, b] = applyBrightness(r, g, b, props.image.brightness);
        }

        if (props.image.contrast !== null) {
          [r, g, b] = applyContrast(r, g, b, props.image.contrast);
        }

        if (props.image.isNegative) {
          [r, g, b] = applyNegative(r, g, b);
        }

        if (props.image.threshold !== null) {
          [r, g, b] = applyBinarization(r, g, b, props.image.threshold);
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }

      setProcessedData(new Uint8ClampedArray(data));
      ctx.putImageData(imageData, 0, 0);
    },
    [props.image],
  );

  const filters: IFilterProps[] = [
    {
      label: "Uśredniający",
      defaultKernels: [defaultAverageKernel],
      onFilterApply: (kernels) => applyFilter(props.image.id, applyWeightedMeanFilter, kernels),
      // hideKernels: true,
    },
    {
      label: "Gaussa",
      defaultKernels: [defaultGaussianKernel],
      onFilterApply: (kernels) => applyFilter(props.image.id, applyWeightedMeanFilter, kernels),
      // hideKernels: true,
    },
    {
      label: "Wyostrzający",
      defaultKernels: [defaultSharpenKernel],
      onFilterApply: (kernels) => applyFilter(props.image.id, applyWeightedMeanFilter, kernels),
      // hideKernels: true,
    },
    {
      label: "Robertsa",
      defaultKernels: [defaultRobertsCrossKernelX, defaultRobertsCrossKernelY],
      onFilterApply: (kernels) => applyFilter(props.image.id, applyDirectionalFilter, kernels),
      kernelsDescription: ["Poziomy", "Pionowy"],
    },
    {
      label: "Sobela",
      defaultKernels: [defaultSobelKernelX, defaultSobelKernelY],
      onFilterApply: (kernels) => applyFilter(props.image.id, applyDirectionalFilter, kernels),
      kernelsDescription: ["Poziomy", "Pionowy"],
    },
    {
      label: "Canny",
      defaultKernels: [defaultGaussianKernel, defaultSobelKernelX, defaultSobelKernelY],
      onFilterApply: (kernels) => applyFilter(props.image.id, applyCannyFilter, kernels),
      kernelsDescription: ["Rozmywający", "Poziomy", "Pionowy"],
    },
  ];

  const handleDownload = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/jpeg");
      link.download = "image.jpg";
      link.click();
    }
  }, []);

  return (
    props.image && (
      <div className="flex flex-col  max-w-[600px] min-w-[600px] gap-2">
        <div className="flex items-center justify-between w-full h-10">
          <h2 className="text-xl font-semibold">Manipulacja obrazem</h2>
          <div className="flex gap-2">
            <ButtonReset onReset={() => revertImage(props.image.id)} />
            <ButtonDownload onDownload={handleDownload} />
            <ButtonDelete onDelete={() => removeImage(props.image.id)} />
          </div>
        </div>
        <div className="flex border-2 flex-col rounded-[14px]  p-2 border-gray-600 w-full items-center justify-between text-gray-600">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[500px] w-full h-full object-contain rounded-md"
          />
          <div className="w-full h-full p-4 place-self-start">
            <Tabs
              tabs={[
                {
                  tabId: "basicManipulationTools",
                  label: "Podstawowe narzędzia",
                  content: (
                    <BasicToolsTab
                      isGrayscale={props.image.isGrayscale}
                      changeGrayscale={(val) => changeGrayscale(props.image.id, val)}
                      brightness={props.image.brightness}
                      changeBrightness={(val) => changeBrightness(props.image.id, val)}
                      contrast={props.image.contrast}
                      changeContrast={(val) => changeContrast(props.image.id, val)}
                      isNegative={props.image.isNegative}
                      changeNegative={(val) => changeNegative(props.image.id, val)}
                      threshold={props.image.threshold}
                      changeThreshold={(val) => changeThreshold(props.image.id, val)}
                    />
                  ),
                },
                {
                  tabId: "filters",
                  label: "Filtry",
                  content: <FiltersTab filters={filters} />,
                },
                {
                  tabId: "histogram",
                  label: "Histogram",
                  content: <HistogramTab data={processedData} />,
                },
                {
                  tabId: "projection",
                  label: "Projekcja",
                  content: (
                    <ProjectionTab
                      data={processedData}
                      height={props.image.height}
                      width={props.image.width}
                    />
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    )
  );
};
