import { useEffect, useRef, useState } from "react";

import { defaultSquareKernel, EMorphology } from "../../utils/morphology";
import { getPupil, detectPupilWithProjections } from "../../utils/pupil";
import { IrisChart } from "./IrisChart";
import { findLargestJumps, listOfMeanPixelValuesInEyeStartingFromPupil } from "../../utils/iris";
import { defaultGaussianKernel } from "../../consts/kernels";
import { applyWeightedMeanFilter } from "../../utils/filter";
import { drawCircle, drawCrosshair } from "../../utils/draw";
import { Button } from "../ui/Buttons";
import {
  generateDaugmanIrisCode,
  irisCodeToCrispImage,
  createIrisComparisonReport,
  defaultDaugmanParams,
  TDaugmanParams,
} from "../../utils/irisCode";
import { Input } from "../ui/Input";
import { Radio } from "../ui/Radio";
import { Separator } from "../ui/Separator";

const MAX_PERSON_ID = 46;
const MAX_IMAGE_ID = 5;
const XL = 4;
const THRESHOLD = 200;
const COMPARISON_THRESHOLD = 0.2;
const OPERATIONS = [
  // Erode 10x to remove holes
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
  // Dilate 10x to balance erode
  EMorphology.Dilate,
  EMorphology.Dilate,
  EMorphology.Dilate,
  EMorphology.Dilate,
  EMorphology.Dilate,
  EMorphology.Dilate,
  EMorphology.Dilate,
  EMorphology.Dilate,
  EMorphology.Dilate,
  EMorphology.Dilate,
  // Erode 5x to remove noise
  EMorphology.Dilate,
  EMorphology.Dilate,
  EMorphology.Dilate,
  EMorphology.Dilate,
  EMorphology.Dilate,
  // Erode 5x to balance dialte
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
  // Erode 3x to increase pupil size
  EMorphology.Erode,
  EMorphology.Erode,
  EMorphology.Erode,
];

interface SavedIrisCode {
  id: string;
  name: string;
  code: number[][];
  personId?: number;
  eye?: string;
  imageId?: number;
  timestamp: number;
}

export const LensPanel = () => {
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(null);
  const normalizedIrisCanvasRef = useRef<HTMLCanvasElement>(null);
  const irisCodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const comparisonCanvasRef = useRef<HTMLCanvasElement>(null);

  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [processedImageData, setProcessedImageData] = useState<ImageData | null>(null);
  const [originalWithCircleData, setOriginalWithCircleData] = useState<ImageData | null>(null);
  const [pupilInfo, setPupilInfo] = useState<{
    radius: number;
    centerX: number;
    centerY: number;
  } | null>(null);
  const [irisRadius, setIrisRadius] = useState<number | null>(null);
  const [chartData, setChartData] = useState<
    Array<{ radius: number; value: number; diff: number }>
  >([]);
  const [irisRadiusIndex, setIrisRadiusIndex] = useState<number | null>(null);

  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [currentEye, setCurrentEye] = useState<string | null>(null);
  const [currentImageNumber, setCurrentImageNumber] = useState<number | null>(null);

  const [normalizedIrisImage, setNormalizedIrisImage] = useState<Uint8ClampedArray | null>(null);
  const [currentIrisCode, setCurrentIrisCode] = useState<number[][] | null>(null);
  const [savedIrisCodes, setSavedIrisCodes] = useState<SavedIrisCode[]>([]);
  const [codeName, setCodeName] = useState<string>("");
  const [selectedSavedCode, setSelectedSavedCode] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<{
    match: boolean;
    distance: number;
    shift: number;
    comparisonVisualization: HTMLCanvasElement;
  } | null>(null);

  const [daugmanParams, setDaugmanParams] = useState<TDaugmanParams>({
    ...defaultDaugmanParams,
  });

  const loadImage = (folder: number | null, eye: string | null, imageNumber: number | null) => {
    if (!folder || !eye || !imageNumber) return;
    const imagePath = `/images/lens/${folder}/${eye}/${imageNumber}.bmp`;

    const canvas = originalCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setOriginalImageData(imageData);

        const processedCanvas = processedCanvasRef.current;
        if (processedCanvas) {
          processedCanvas.width = img.width;
          processedCanvas.height = img.height;

          const processedCtx = processedCanvas.getContext("2d", { willReadFrequently: true });
          if (processedCtx) {
            processedCtx.putImageData(imageData, 0, 0);
          }
        }
      };
      img.src = imagePath;
    }
  };

  const loadRandomImage = () => {
    setCurrentFolder(Math.floor(Math.random() * MAX_PERSON_ID) + 1);
    setCurrentEye(Math.random() < 0.5 ? "left" : "right");
    setCurrentImageNumber(Math.floor(Math.random() * MAX_IMAGE_ID) + 1);
  };

  const handlePupil = () => {
    if (!originalImageData) return;

    setOriginalWithCircleData(null);
    setCurrentIrisCode(null);
    setNormalizedIrisImage(null);

    const processedData = getPupil(
      originalImageData.data,
      originalImageData.width,
      originalImageData.height,
      XL,
      THRESHOLD,
      OPERATIONS,
      defaultSquareKernel,
    );

    const pupilData = detectPupilWithProjections(
      processedData,
      originalImageData.width,
      originalImageData.height,
    );

    if (pupilData) {
      const { radius, centerX, centerY } = pupilData;
      setPupilInfo(pupilData);

      let pupilImageData = new Uint8ClampedArray(processedData);
      pupilImageData = drawCircle(
        pupilImageData,
        originalImageData.width,
        originalImageData.height,
        centerX,
        centerY,
        radius,
      );

      pupilImageData = drawCrosshair(
        pupilImageData,
        originalImageData.width,
        originalImageData.height,
        centerX,
        centerY,
        5,
      );

      setProcessedImageData(
        new ImageData(pupilImageData, originalImageData.width, originalImageData.height),
      );

      let visualizationImageData = new Uint8ClampedArray(originalImageData.data);
      visualizationImageData = drawCircle(
        visualizationImageData,
        originalImageData.width,
        originalImageData.height,
        centerX,
        centerY,
        radius,
      );

      visualizationImageData = drawCrosshair(
        visualizationImageData,
        originalImageData.width,
        originalImageData.height,
        centerX,
        centerY,
        5,
      );

      setOriginalWithCircleData(
        new ImageData(visualizationImageData, originalImageData.width, originalImageData.height),
      );
    }
  };

  const handleIris = () => {
    if (!originalImageData || !pupilInfo) return;

    let analyzeData = originalImageData.data;

    analyzeData = new Uint8ClampedArray(
      applyWeightedMeanFilter(analyzeData, originalImageData.width, originalImageData.height, [
        defaultGaussianKernel,
      ]),
    );

    const meanValues = listOfMeanPixelValuesInEyeStartingFromPupil(
      analyzeData,
      originalImageData.width,
      originalImageData.height,
      pupilInfo.centerX,
      pupilInfo.centerY,
      pupilInfo.radius * 3,
      true,
      1,
    );

    const differences: number[] = [0];
    for (let i = 1; i < meanValues.length; i++) {
      differences.push(Math.abs(meanValues[i] - meanValues[i - 1]));
    }

    const { pupilJump, irisJump } = findLargestJumps(
      meanValues,
      pupilInfo.radius,
      pupilInfo.radius * 1.5,
    );

    const updatedJumpIndices: number[] = [];
    if (pupilJump !== null) updatedJumpIndices.push(pupilJump);
    if (irisJump !== null) updatedJumpIndices.push(irisJump);

    setIrisRadiusIndex(irisJump);

    if (irisJump !== null) {
      const calculatedIrisRadius = pupilInfo.radius + irisJump;
      setIrisRadius(calculatedIrisRadius);

      let newImageData = new Uint8ClampedArray(originalImageData.data);
      newImageData = drawCircle(
        newImageData,
        originalImageData.width,
        originalImageData.height,
        pupilInfo.centerX,
        pupilInfo.centerY,
        pupilInfo.radius,
        [0, 255, 0, 255],
      );

      newImageData = drawCircle(
        newImageData,
        originalImageData.width,
        originalImageData.height,
        pupilInfo.centerX,
        pupilInfo.centerY,
        calculatedIrisRadius,
        [0, 170, 255, 255],
      );

      setOriginalWithCircleData(
        new ImageData(newImageData, originalImageData.width, originalImageData.height),
      );
    }

    const formattedData = meanValues.map((value, i) => ({
      radius: pupilInfo.radius + i,
      value: value,
      diff: differences[i],
    }));

    setChartData(formattedData);
  };

  const generateIrisCode = () => {
    if (!originalImageData || !pupilInfo || !irisRadius) return;

    const result = generateDaugmanIrisCode(
      originalImageData.data,
      originalImageData.width,
      originalImageData.height,
      pupilInfo.centerX,
      pupilInfo.centerY,
      pupilInfo.radius,
      irisRadius,
      daugmanParams,
    );

    setCurrentIrisCode(result.irisCode);
    setNormalizedIrisImage(result.normalizedImage);
  };

  const saveCurrentIrisCode = () => {
    if (!currentIrisCode || !codeName.trim()) return;

    const newSavedCode: SavedIrisCode = {
      id: Date.now().toString(),
      name: codeName.trim(),
      code: currentIrisCode,
      personId: currentFolder || undefined,
      eye: currentEye || undefined,
      imageId: currentImageNumber || undefined,
      timestamp: Date.now(),
    };

    setSavedIrisCodes((prev) => [...prev, newSavedCode]);
    setCodeName("");
  };

  const deleteSavedIrisCode = (id: string) => {
    setSavedIrisCodes((prev) => prev.filter((code) => code.id !== id));
    if (selectedSavedCode === id) {
      setSelectedSavedCode(null);
      setComparisonResult(null);
    }
  };

  const updateDaugmanParam = (param: keyof TDaugmanParams, value: number) => {
    setDaugmanParams((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  // Load image when path params changes
  useEffect(
    () => loadImage(currentFolder, currentEye, currentImageNumber),
    [currentFolder, currentEye, currentImageNumber],
  );

  // Handle pupil when original image changes
  useEffect(() => {
    if (originalImageData) handlePupil();
  }, [originalImageData]);

  // Show processed image when data chagne
  useEffect(() => {
    if (!processedImageData) return;

    const processedCanvas = processedCanvasRef.current;
    if (!processedCanvas) return;

    const ctx = processedCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.putImageData(processedImageData, 0, 0);
  }, [processedImageData]);

  // Draw circle on original image
  useEffect(() => {
    if (!originalWithCircleData) return;

    const originalCanvas = originalCanvasRef.current;
    if (!originalCanvas) return;

    const ctx = originalCanvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.putImageData(originalWithCircleData, 0, 0);
  }, [originalWithCircleData]);

  // Handle iris when pupil info or original data changes
  useEffect(() => {
    if (pupilInfo && originalImageData) {
      handleIris();
    }
  }, [pupilInfo, originalImageData]);

  // Show normaized iris
  useEffect(() => {
    const normalizedCanvas = normalizedIrisCanvasRef.current;
    if (normalizedCanvas && normalizedIrisImage) {
      normalizedCanvas.width = daugmanParams.normalizedWidth;
      normalizedCanvas.height = daugmanParams.normalizedHeight;
      const ctx = normalizedCanvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        const imageData = new ImageData(
          new Uint8ClampedArray(normalizedIrisImage),
          daugmanParams.normalizedWidth,
          daugmanParams.normalizedHeight,
        );
        ctx.putImageData(imageData, 0, 0);
      }
    }
  }, [normalizedIrisImage, daugmanParams]);

  // Show iris code
  useEffect(() => {
    const irisCodeCanvas = irisCodeCanvasRef.current;
    if (irisCodeCanvas && currentIrisCode) {
      const visualizationCanvas = irisCodeToCrispImage(currentIrisCode, 4);
      irisCodeCanvas.width = visualizationCanvas.width;
      irisCodeCanvas.height = visualizationCanvas.height;
      const ctx = irisCodeCanvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.clearRect(0, 0, irisCodeCanvas.width, irisCodeCanvas.height);
        ctx.drawImage(visualizationCanvas, 0, 0);
      }
    }
  }, [currentIrisCode]);

  // show results
  useEffect(() => {
    const comparisonCanvas = comparisonCanvasRef.current;
    if (comparisonCanvas && comparisonResult) {
      comparisonCanvas.width = comparisonResult.comparisonVisualization.width;
      comparisonCanvas.height = comparisonResult.comparisonVisualization.height;
      const ctx = comparisonCanvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.clearRect(0, 0, comparisonCanvas.width, comparisonCanvas.height);
        ctx.drawImage(comparisonResult.comparisonVisualization, 0, 0);
      }
    }
  }, [comparisonResult]);

  // load iris codes from storage
  useEffect(() => {
    const savedCodes = localStorage.getItem("savedIrisCodes");
    if (savedCodes) {
      try {
        setSavedIrisCodes(JSON.parse(savedCodes));
      } catch (e) {
        console.error("Błąd przy wczytywaniu kodów tęczówek:", e);
      }
    }
  }, []);

  // Save iris code to local storage
  useEffect(() => {
    if (savedIrisCodes.length > 0) {
      localStorage.setItem("savedIrisCodes", JSON.stringify(savedIrisCodes));
    }
  }, [savedIrisCodes]);

  // Show comparison result when selected code changes
  useEffect(() => {
    if (!currentIrisCode || !selectedSavedCode) return;

    const selectedCode = savedIrisCodes.find((code) => code.id === selectedSavedCode);
    if (!selectedCode) return;

    const report = createIrisComparisonReport(
      currentIrisCode,
      selectedCode.code,
      COMPARISON_THRESHOLD,
    );
    setComparisonResult({
      match: report.match,
      distance: report.distance,
      shift: report.shift,
      comparisonVisualization: report.comparisonVisualization,
    });
  }, [selectedSavedCode, currentIrisCode, savedIrisCodes]);

  return (
    <div className="flex flex-col max-w-[1200px] min-w-[800px] gap-10 border-2 border-gray-600 rounded-[14px] p-4 bg-gray-800 text-gray-200">
      <div className="flex flex-col w-full gap-4">
        <h1 className="text-2xl font-bold">Analiza tęczówki</h1>
        <div className="flex w-full justify-between">
          <div className="flex gap-6">
            <Input
              value={currentFolder?.toString()}
              onChange={(val) => setCurrentFolder(Number(val))}
              type="number"
              minValue={1}
              maxValue={MAX_PERSON_ID}
              label="Katalog:"
            />
            <Radio
              options={[
                { label: "Lewe", value: "left" },
                { label: "Prawe", value: "right" },
              ]}
              onChange={(val) => setCurrentEye(val)}
              value={currentEye ?? ""}
              label="Oko:"
            />
            <Input
              value={currentImageNumber?.toString()}
              onChange={(val) => setCurrentImageNumber(Number(val))}
              type="number"
              minValue={1}
              maxValue={MAX_IMAGE_ID}
              label="Id zdjęcia:"
            />
          </div>
          <div>
            <Button label="Wczytaj losowe zdjęcie" onClick={loadRandomImage} />
          </div>
        </div>
      </div>

      {/* Original image and processed one with marked pupil */}
      {currentFolder && currentEye && currentImageNumber && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <div className="flex gap-4 w-full">
              <div className="flex flex-col items-center w-1/2 gap-2">
                <h3 className="text-lg font-medium">Obraz oryginalny</h3>
                <canvas
                  ref={originalCanvasRef}
                  className="max-w-full max-h-[350px] w-full object-contain rounded-md border border-slate-600"
                />
              </div>

              <div className="flex flex-col items-center w-1/2 gap-2">
                <h3 className="text-lg font-medium">Obraz przetworzony</h3>
                <canvas
                  ref={processedCanvasRef}
                  className="max-w-full max-h-[350px] w-full object-contain rounded-md border border-slate-600"
                />
              </div>
            </div>
            {pupilInfo && (
              <div className="flex text-center justify-evenly">
                <p>
                  Promień źrenicy: <strong>{pupilInfo.radius}px</strong>
                </p>
                <p>
                  Środek źrenicy: (X) <strong>{pupilInfo.centerX}px</strong> (Y){" "}
                  <strong>{pupilInfo.centerY}px</strong>
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Iris chart */}
      {pupilInfo && originalImageData && chartData.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col gap-2 w-full">
            <IrisChart chartData={chartData} irisRadiusIndex={irisRadiusIndex} />
            {irisRadius && (
              <div className="flex text-center justify-evenly">
                <p>
                  Promień tęczówki: <strong>{irisRadius}px</strong>
                </p>
                <p>
                  Stosunek źrenica/tęczówka:{" "}
                  <strong>{(pupilInfo.radius / irisRadius).toFixed(2)}</strong>
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Daugman algorythm */}
      {pupilInfo && irisRadius && (
        <>
          <Separator />
          <div className="flex flex-col gap-4 w-full">
            <h3 className="text-lg font-medium">Algorytm Daugmana</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-gray-400 mb-1">Częstotliwość filtra Gabora</label>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.05"
                  value={daugmanParams.frequency}
                  onChange={(e) => updateDaugmanParam("frequency", parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between">
                  <span className="text-xs">0.1</span>
                  <span className="text-sm">{daugmanParams.frequency.toFixed(2)}</span>
                  <span className="text-xs">3.0</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Odchylenie standardowe (sigma)</label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.5"
                  value={daugmanParams.sigma}
                  onChange={(e) => updateDaugmanParam("sigma", parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between">
                  <span className="text-xs">1</span>
                  <span className="text-sm">{daugmanParams.sigma.toFixed(1)}</span>
                  <span className="text-xs">15</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button label="Generuj kod tęczówki" onClick={generateIrisCode} />
            </div>
          </div>
        </>
      )}

      {/* Normalized iris and iris code */}
      {normalizedIrisImage && (
        <>
          <Separator />
          <div className="flex flex-col gap-4 w-full">
            <div className="flex flex-col md:flex-row gap-4 w-full">
              <div className="flex flex-col items-center w-full md:w-1/2 gap-2">
                <h4 className="text-md font-medium">Znormalizowana tęczówka</h4>
                <canvas
                  ref={normalizedIrisCanvasRef}
                  className="max-w-full object-contain rounded-md border border-gray-300"
                />
              </div>

              <div className="flex flex-col items-center w-full md:w-1/2 gap-2">
                <h4 className="text-md font-medium">Kod tęczówki</h4>
                <canvas
                  ref={irisCodeCanvasRef}
                  className="max-w-full object-contain rounded-md border border-gray-300"
                />
              </div>
            </div>

            <div>
              <h4 className="text-md font-medium mb-2">Zapisz aktualny kod</h4>
              <div className="flex gap-2">
                <Input
                  value={codeName}
                  onChange={(val) => setCodeName(val)}
                  type="text"
                  placeholder="Podaj nazwę zapisu"
                />
                <Button label="Zapisz kod" onClick={saveCurrentIrisCode} className="h-fit" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Comparison panel */}
      {currentIrisCode && savedIrisCodes.length > 0 && (
        <>
          <Separator />
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <h4 className="text-md font-medium">Lista zapisanych kodów</h4>
              <div className="flex flex-col max-h-[220px] overflow-y-scroll border border-gray-600 rounded p-1 gap-1">
                {savedIrisCodes.map((code) => (
                  <div
                    key={code.id}
                    className={`flex justify-between items-center p-2 rounded cursor-pointer ${
                      selectedSavedCode === code.id
                        ? "bg-blue-900"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                    onClick={() => setSelectedSavedCode(code.id)}
                  >
                    <div>
                      <div className="font-medium">{code.name}</div>
                      <div className="text-xs text-gray-400">
                        {code.personId && code.eye && code.imageId
                          ? `Osoba: ${code.personId}, Oko: ${code.eye}, Obraz: ${code.imageId}`
                          : "Brak danych źródłowych"}
                      </div>
                    </div>
                    <button
                      className="text-red-400 hover:text-red-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSavedIrisCode(code.id);
                      }}
                    >
                      Usuń
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <h4 className="text-md font-medium">Wynik porównania</h4>
              {comparisonResult ? (
                <div className="flex flex-col gap-1 border border-gray-600 rounded p-3">
                  <div
                    className={`text-center p-2 rounded font-bold ${
                      comparisonResult.match ? "bg-green-800 text-white" : "bg-red-800 text-white"
                    }`}
                  >
                    {comparisonResult.match ? "DOPASOWANIE" : "BRAK DOPASOWANIA"}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-400">Odległość Hamminga:</p>
                      <p className="text-xl font-semibold">
                        {comparisonResult.distance.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Optymalne przesunięcie:</p>
                      <p className="text-xl font-semibold">{comparisonResult.shift}</p>
                    </div>
                  </div>

                  <div className="">
                    <h5 className="text-sm font-medium text-center">Wizualizacja różnic</h5>
                    <div className="flex justify-center">
                      <canvas
                        ref={comparisonCanvasRef}
                        className="max-w-full object-contain rounded-md border border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-600 rounded p-4 text-center text-gray-400">
                  Wybierz kod do porównania
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
