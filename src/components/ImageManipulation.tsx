import { useState, useEffect, useRef } from "react";
import {
  applyGrayscale,
  applyBrightness,
  applyContrast,
  applyNegative,
  applyBinarization,
} from "../utils/manipulate";
import {
  applyAverageFilter,
  applyGaussianFilter,
  applySharpenFilter,
  defaultAverageKernel,
  defaultGaussianKernel,
  defaultSharpenKernel,
} from "../utils/filter";

interface ImageManipulationProps {
  image: string | null;
}

export const ImageManipulation = (props: ImageManipulationProps) => {
  const [isGrayscale, setIsGrayscale] = useState<boolean | null>(null);
  const [brightness, setBrightness] = useState<number | null>(null);
  const [contrast, setContrast] = useState<number | null>(null);
  const [isNegative, setIsNegative] = useState<boolean | null>(null);
  const [threshold, setThreshold] = useState<number | null>(null);
  const [isAverageFilter, setIsAverageFilter] = useState<boolean | null>(null);
  const [isGaussianFilter, setIsGaussianFilter] = useState<boolean | null>(null);
  const [isSharpenFilter, setIsSharpenFilter] = useState<boolean | null>(null);
  const [averageKernel, setAverageKernel] = useState<number[][]>(defaultAverageKernel);
  const [gaussianKernel, setGaussianKernel] = useState<number[][]>(defaultGaussianKernel);
  const [sharpenKernel, setSharpenKernel] = useState<number[][]>(defaultSharpenKernel);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (props.image && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = props.image;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        applyFilters(ctx, img.width, img.height);
      };
    }
  }, [
    props.image,
    isGrayscale,
    brightness,
    contrast,
    isNegative,
    threshold,
    isAverageFilter,
    isGaussianFilter,
    isSharpenFilter,
  ]);

  const applyFilters = (ctx: CanvasRenderingContext2D | null, width: number, height: number) => {
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i];
      let g = data[i + 1];
      let b = data[i + 2];

      if (isGrayscale) {
        [r, g, b] = applyGrayscale(r, g, b);
      }

      if (brightness !== null) {
        [r, g, b] = applyBrightness(r, g, b, brightness);
      }

      if (contrast !== null) {
        [r, g, b] = applyContrast(r, g, b, contrast);
      }

      if (isNegative) {
        [r, g, b] = applyNegative(r, g, b);
      }

      if (threshold !== null) {
        [r, g, b] = applyBinarization(r, g, b, threshold);
      }

      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }

    ctx.putImageData(imageData, 0, 0);

    if (isAverageFilter) {
      applyAverageFilter(ctx, width, height, averageKernel);
    }

    if (isGaussianFilter) {
      applyGaussianFilter(ctx, width, height, gaussianKernel);
    }

    if (isSharpenFilter) {
      applySharpenFilter(ctx, width, height, sharpenKernel);
    }
  };

  const handleKernelChange = (
    setKernel: React.Dispatch<React.SetStateAction<number[][]>>,
    row: number,
    col: number,
    value: number,
  ) => {
    setKernel((prevKernel) => {
      const newKernel = [...prevKernel];
      newKernel[row][col] = value;
      return newKernel;
    });
  };

  return (
    <div className="flex flex-col w-full gap-2 mt-4">
      <h2 className="text-xl font-semibold">Manipulacja obrazem</h2>
      <div className="flex border-2 rounded-[14px] p-2 border-gray-600 w-full h-[500px] items-center justify-between text-gray-600">
        <canvas ref={canvasRef} className="max-w-full max-h-full object-contain rounded-md" />
        <div className="flex flex-col gap-2 mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isGrayscale !== null}
              onChange={() => setIsGrayscale(isGrayscale === null ? true : null)}
            />
            <button
              className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                isGrayscale === null ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => setIsGrayscale(!isGrayscale)}
              disabled={isGrayscale === null}
            >
              {isGrayscale ? "Wyłącz skalę szarości" : "Włącz skalę szarości"}
            </button>
          </label>
          <label className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={brightness !== null}
                onChange={() => setBrightness(brightness === null ? 100 : null)}
              />
              Jasność
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness ?? 100}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full"
              disabled={brightness === null}
            />
          </label>
          <label className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={contrast !== null}
                onChange={() => setContrast(contrast === null ? 100 : null)}
              />
              Kontrast
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast ?? 100}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full"
              disabled={contrast === null}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isNegative !== null}
              onChange={() => setIsNegative(isNegative === null ? true : null)}
            />
            <button
              className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                isNegative === null ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => setIsNegative(!isNegative)}
              disabled={isNegative === null}
            >
              {isNegative ? "Wyłącz negatyw" : "Włącz negatyw"}
            </button>
          </label>
          <label className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={threshold !== null}
                onChange={() => setThreshold(threshold === null ? 128 : null)}
              />
              Binaryzacja
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={threshold ?? 128}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
              disabled={threshold === null}
            />
          </label>
          <label className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isAverageFilter !== null}
                onChange={() => setIsAverageFilter(isAverageFilter === null ? true : null)}
              />
              <button
                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                  isAverageFilter === null ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => setIsAverageFilter(!isAverageFilter)}
                disabled={isAverageFilter === null}
              >
                {isAverageFilter ? "Wyłącz filtr uśredniający" : "Włącz filtr uśredniający"}
              </button>
            </div>
            {isAverageFilter !== null && (
              <div className="grid grid-cols-3 gap-2">
                {averageKernel.map((row, rowIndex) =>
                  row.map((value, colIndex) => (
                    <input
                      key={`${rowIndex}-${colIndex}`}
                      type="number"
                      value={value}
                      onChange={(e) =>
                        handleKernelChange(
                          setAverageKernel,
                          rowIndex,
                          colIndex,
                          Number(e.target.value),
                        )
                      }
                      className="w-12 text-center"
                    />
                  )),
                )}
              </div>
            )}
          </label>
          <label className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isGaussianFilter !== null}
                onChange={() => setIsGaussianFilter(isGaussianFilter === null ? true : null)}
              />
              <button
                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                  isGaussianFilter === null ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => setIsGaussianFilter(!isGaussianFilter)}
                disabled={isGaussianFilter === null}
              >
                {isGaussianFilter ? "Wyłącz filtr Gaussa" : "Włącz filtr Gaussa"}
              </button>
            </div>
            {isGaussianFilter !== null && (
              <div className="grid grid-cols-3 gap-2">
                {gaussianKernel.map((row, rowIndex) =>
                  row.map((value, colIndex) => (
                    <input
                      key={`${rowIndex}-${colIndex}`}
                      type="number"
                      value={value}
                      onChange={(e) =>
                        handleKernelChange(
                          setGaussianKernel,
                          rowIndex,
                          colIndex,
                          Number(e.target.value),
                        )
                      }
                      className="w-12 text-center"
                    />
                  )),
                )}
              </div>
            )}
          </label>
          <label className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSharpenFilter !== null}
                onChange={() => setIsSharpenFilter(isSharpenFilter === null ? true : null)}
              />
              <button
                className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 ${
                  isSharpenFilter === null ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => setIsSharpenFilter(!isSharpenFilter)}
                disabled={isSharpenFilter === null}
              >
                {isSharpenFilter ? "Wyłącz filtr wyostrzający" : "Włącz filtr wyostrzający"}
              </button>
            </div>
            {isSharpenFilter !== null && (
              <div className="grid grid-cols-3 gap-2">
                {sharpenKernel.map((row, rowIndex) =>
                  row.map((value, colIndex) => (
                    <input
                      key={`${rowIndex}-${colIndex}`}
                      type="number"
                      value={value}
                      onChange={(e) =>
                        handleKernelChange(
                          setSharpenKernel,
                          rowIndex,
                          colIndex,
                          Number(e.target.value),
                        )
                      }
                      className="w-12 text-center"
                    />
                  )),
                )}
              </div>
            )}
          </label>
        </div>
      </div>
    </div>
  );
};
