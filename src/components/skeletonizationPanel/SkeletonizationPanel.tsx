import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Buttons";
import { Input } from "../ui/Input";
import { Radio } from "../ui/Radio";
import { Separator } from "../ui/Separator";
import { enhanceWithGabor } from "../../utils/filter";
import {
  binarizeClampedArray,
  contrastStretch,
  negateClampedArray,
  normalizeClampedArray,
} from "../../utils/manipulate";
import { kmmThinning, morphologicalThinning } from "../../utils/skeletonization";

// Stałe dla limitów danych
const MAX_IMAGE_ID = 5;
const FINGER_NAMES = ["Kciuk", "Wskazujący", "Środkowy", "Serdeczny", "Mały"];

export const SkeletonizationPanel = () => {
  // Referencje do canvasów
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const skeletonCanvasRef = useRef<HTMLCanvasElement>(null);
  const minutiaeCanvasRef = useRef<HTMLCanvasElement>(null);

  // Stany obrazów
  const [originalImageData, setOriginalImageData] = useState<ImageData | null>(null);
  const [skeletonImageData, setSkeletonImageData] = useState<ImageData | null>(null);
  const [minutiaeImageData, setMinutiaeImageData] = useState<ImageData | null>(null);
  const [binarizationThreshold, setBinarizationThreshold] = useState(28);
  const [useNormalize, setUseNormalize] = useState(false);
  const [useGaborFilter, setUseGaborFilter] = useState(false);
  const [gaborParams, setGaborParams] = useState({
    frequencies: [0.14],
    thetas: [0, Math.PI, Math.PI / 8],
    kernelSize: 21,
    sigma: 4,
    gamma: 5,
    psi: 0,
  });

  // Stany wyboru parametrów obrazu
  const [currentHand, setCurrentHand] = useState<string | null>(null);
  const [currentFinger, setCurrentFinger] = useState<number | null>(null);
  const [currentImageNumber, setCurrentImageNumber] = useState<number | null>(null);

  // Stany dla algorytmu i wyników
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<"morphological" | "kmm">(
    "morphological",
  );
  const [minutiaeStats, setMinutiaeStats] = useState<{
    endings: number;
    bifurcations: number;
    cores: number;
    deltas: number;
  } | null>(null);

  // Ładowanie obrazu linii papilarnej
  const loadImage = (hand: string | null, finger: number | null, imageNumber: number | null) => {
    if (!hand || !finger || !imageNumber) return;
    console.log("Załaduj obraz:", hand, finger, imageNumber);

    const imagePath = `/images/fingerprints/${hand == "left" ? "l" : "r"}${finger}_${imageNumber}.bmp`;
    // const imagePath = `/images/fingerprints/test.png  `;

    const canvas = originalCanvasRef.current;
    if (canvas) {
      console.log("Załaduj obraz:", imagePath);
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setOriginalImageData(imageData);
        console.log("Załadowano obraz:", imagePath);

        setSkeletonImageData(null);
        setMinutiaeImageData(null);
        setMinutiaeStats(null);
      };
      img.onerror = () => {
        console.error(`Nie można załadować obrazu: ${imagePath}`);
      };
      img.src = imagePath;
    }
  };

  const loadRandomImage = () => {
    setCurrentHand(Math.random() < 0.5 ? "left" : "right");
    setCurrentFinger(Math.floor(Math.random() * 5) + 1);
    setCurrentImageNumber(Math.floor(Math.random() * MAX_IMAGE_ID) + 1);
  };

  const performSkeletonization = () => {
    if (!originalImageData) return;

    const { width, height, data } = originalImageData;

    let processedData = new Uint8ClampedArray(data);

    if (useNormalize) {
      processedData = contrastStretch(normalizeClampedArray(processedData, width, height));
    }

    // Zastosowanie filtra Gabora, jeśli checkbox jest zaznaczony
    if (useGaborFilter) {
      processedData = enhanceWithGabor(
        processedData,
        width,
        height,
        gaborParams.frequencies,
        gaborParams.thetas,
        gaborParams.kernelSize,
        gaborParams.sigma,
        gaborParams.gamma,
        gaborParams.psi,
      );
    }

    processedData = binarizeClampedArray(
      new Uint8ClampedArray(processedData),
      width,
      height,
      binarizationThreshold,
    );

    if (useGaborFilter) processedData = negateClampedArray(processedData);

    if (selectedAlgorithm === "morphological") {
      processedData = new Uint8ClampedArray(
        morphologicalThinning(processedData, width, height, 50),
      );
    } else {
      processedData = new Uint8ClampedArray(kmmThinning(processedData, width, height, 50));
    }

    const imageData = new ImageData(new Uint8ClampedArray(processedData), width, height);
    setSkeletonImageData(imageData);

    setMinutiaeImageData(null);
    setMinutiaeStats(null);
  };

  useEffect(() => {
    loadImage(currentHand, currentFinger, currentImageNumber);
  }, [currentHand, currentFinger, currentImageNumber]);

  useEffect(() => {
    if (!originalImageData || !originalCanvasRef.current) return;

    const canvas = originalCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = originalImageData.width;
      canvas.height = originalImageData.height;
      ctx.putImageData(originalImageData, 0, 0);
    }
  }, [originalImageData]);

  useEffect(() => {
    if (!skeletonImageData || !skeletonCanvasRef.current) return;

    const canvas = skeletonCanvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      canvas.width = skeletonImageData.width;
      canvas.height = skeletonImageData.height;
      ctx.putImageData(skeletonImageData, 0, 0);
    }
  }, [skeletonImageData]);

  useEffect(() => {
    if (!minutiaeImageData || !minutiaeCanvasRef.current) return;

    const canvas = minutiaeCanvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      canvas.width = minutiaeImageData.width;
      canvas.height = minutiaeImageData.height;
      ctx.putImageData(minutiaeImageData, 0, 0);
    }
  }, [minutiaeImageData]);

  return (
    <div className="flex flex-col max-w-[1200px] min-w-[800px] gap-10 border-2 border-gray-600 rounded-[14px] p-4 bg-gray-800 text-gray-200">
      <div className="flex flex-col w-full gap-4">
        <h1 className="text-2xl font-bold">Analiza linii papilarnych</h1>

        <div className="flex w-full justify-between">
          <div className="flex gap-6">
            <Radio
              options={[
                { label: "Lewa", value: "left" },
                { label: "Prawa", value: "right" },
              ]}
              onChange={(val) => setCurrentHand(val)}
              value={currentHand ?? ""}
              label="Ręka:"
            />

            <div className="flex flex-col">
              <label className="mb-1 text-sm text-gray-400">Palec:</label>
              <select
                className="px-3 py-1.5 bg-gray-700 border border-gray-600 rounded text-white"
                value={currentFinger ?? ""}
                onChange={(e) => setCurrentFinger(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Wybierz</option>
                {FINGER_NAMES.map((name, index) => (
                  <option key={index + 1} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              value={currentImageNumber?.toString() ?? ""}
              onChange={(val) => setCurrentImageNumber(val ? Number(val) : null)}
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

      {currentFinger && currentHand && currentImageNumber && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-medium">Obraz oryginalny</h3>
            <div className="flex justify-center">
              <canvas
                ref={originalCanvasRef}
                className="max-w-full max-h-[350px] object-contain rounded-md border border-slate-600"
              />
            </div>
          </div>

          {/* Panel wyboru algorytmu i szkieletyzacji */}
          <Separator />
          <div className="flex flex-col gap-4 w-full">
            <h3 className="text-lg font-medium">Szkieletyzacja</h3>

            <div className="flex flex-col gap-2">
              <span className="text-gray-300">Wybór algorytmu</span>
              <div className="flex gap-2">
                <Button
                  label="Szkieletyzacja morfologiczna"
                  onClick={() => setSelectedAlgorithm("morphological")}
                  className={selectedAlgorithm === "morphological" ? "bg-emerald-800" : ""}
                />
                <Button
                  label="Algorytm KMM"
                  onClick={() => setSelectedAlgorithm("kmm")}
                  className={selectedAlgorithm === "kmm" ? "bg-emerald-800" : ""}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-gray-300">Opcje poprawy krawędzi</span>
              <div className="flex items-center gap-2 ">
                <input
                  type="checkbox"
                  id="useNormalize"
                  checked={useNormalize}
                  onChange={(e) => setUseNormalize(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="useNormalize" className="text-gray-300">
                  Uwzględnij normalizację
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useGaborFilter"
                  checked={useGaborFilter}
                  onChange={(e) => setUseGaborFilter(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="useGaborFilter" className="text-gray-300">
                  Uwzględnij filtr Gabora
                </label>
              </div>
              <div className="flex flex-col gap-4 p-4 relative">
                <div
                  className={`absolute top-0 left-0 w-full h-full bg-gray-900 rounded shadow-gray-800 transition-all ${useGaborFilter ? "opacity-0 cursor-default pointer-events-none" : "opacity-60 cursor-not-allowed"}`}
                ></div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Rozmiar jądra"
                    type="number"
                    value={gaborParams.kernelSize.toString()}
                    onChange={(val) => setGaborParams({ ...gaborParams, kernelSize: Number(val) })}
                  />
                  <Input
                    label="Sigma"
                    type="number"
                    value={gaborParams.sigma.toString()}
                    onChange={(val) => setGaborParams({ ...gaborParams, sigma: Number(val) })}
                  />
                  <Input
                    label="Gamma"
                    type="number"
                    value={gaborParams.gamma.toString()}
                    onChange={(val) => setGaborParams({ ...gaborParams, gamma: Number(val) })}
                  />
                  <Input
                    label="Psi"
                    type="number"
                    value={gaborParams.psi.toString()}
                    onChange={(val) => setGaborParams({ ...gaborParams, psi: Number(val) })}
                  />
                  <Input
                    label="Częstotliwości"
                    type="text"
                    value={gaborParams.frequencies.join(", ")}
                    onChange={(val) =>
                      setGaborParams({
                        ...gaborParams,
                        frequencies: val.split(",").map(Number),
                      })
                    }
                  />
                  <Input
                    label="Kąty"
                    type="text"
                    value={gaborParams.thetas.join(", ")}
                    onChange={(val) =>
                      setGaborParams({ ...gaborParams, thetas: val.split(",").map(Number) })
                    }
                  />
                </div>
              </div>
              <Input
                label="Poziom progowania binarizacji"
                type="number"
                minValue={0}
                maxValue={255}
                value={binarizationThreshold.toString()}
                onChange={(val) => setBinarizationThreshold(val ? Number(val) : 0)}
              />
            </div>

            <div className="flex items-end">
              <Button label="Wykonaj szkieletyzację" onClick={performSkeletonization} />
            </div>
          </div>
        </>
      )}

      {/* Wyniki szkieletyzacji i minucje */}
      {skeletonImageData && (
        <>
          <Separator />
          <div className="flex flex-col md:flex-row gap-4 w-full">
            <div className="flex flex-col gap-2 w-full md:w-1/2">
              <h3 className="text-lg font-medium">Ścieniony obraz</h3>
              <canvas ref={skeletonCanvasRef} className="w-full border border-gray-600 rounded" />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
