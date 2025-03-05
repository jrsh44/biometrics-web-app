import { useEffect, useRef } from "react";
import {
  applyGrayscale,
  applyBrightness,
  applyContrast,
  applyNegative,
  applyBinarization,
} from "../utils/manipulate";
import { defaultAverageKernel, defaultGaussianKernel, defaultSharpenKernel } from "../utils/filter";
import { Tabs } from "./ui/Tabs";
import { BasicToolsTab } from "./BasicToolsTab";
import { FiltersTab, TFilter } from "./FiltersTab";
import { TImage } from "../utils/useImage";

interface ImageManipulationProps {
  image: TImage;
}

export const ImageManipulation = (props: ImageManipulationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (props.image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = props.image.path;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        applyFilters(ctx, img.width, img.height);
      };
    }
  }, [props.image]);

  const applyFilters = (ctx: CanvasRenderingContext2D | null, width: number, height: number) => {
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

    ctx.putImageData(imageData, 0, 0);
  };

  const filters: TFilter[] = [
    {
      label: "Filtr uśredniający",
      defaultKernel: defaultAverageKernel,
      onFilterApply: (kernel) => console.log(kernel),
    },
    {
      label: "Filtr Gaussa",
      defaultKernel: defaultGaussianKernel,
      onFilterApply: (kernel) => console.log(kernel),
    },
    {
      label: "Wyostrzanie",
      defaultKernel: defaultSharpenKernel,
      onFilterApply: (kernel) => console.log(kernel),
    },
  ];

  return (
    props.image && (
      <div className="flex flex-col max-w-[600px] min-w-[400px] gap-2">
        <h2 className="text-xl font-semibold">Manipulacja obrazem #1</h2>
        <div className="flex border-2 flex-col rounded-[14px]  p-2 border-gray-600 w-full items-center justify-between text-gray-600">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[500px] w-full h-full object-contain rounded-md shrink"
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
                      setIsGrayscale={setIsGrayscale}
                      brightness={props.image.brightness}
                      setBrightness={setBrightness}
                      contrast={props.image.contrast}
                      setContrast={setContrast}
                      isNegative={props.image.isNegative}
                      setIsNegative={setIsNegative}
                      threshold={props.image.threshold}
                      setThreshold={setThreshold}
                    />
                  ),
                },
                {
                  tabId: "filters",
                  label: "Filtry",
                  content: <FiltersTab filters={filters} />,
                },
              ]}
            />
          </div>
        </div>
      </div>
    )
  );
};
