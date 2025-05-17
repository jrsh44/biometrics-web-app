import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Buttons";
import { Input } from "../ui/Input";
import { Radio } from "../ui/Radio";
import { Separator } from "../ui/Separator";
import { morphologicalThinning } from "../../utils/skeletonization";
import { binarizeClampedArray } from "../../utils/manipulate";

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

  // Stany wyboru parametrów obrazu
  const [currentHand, setCurrentHand] = useState<string | null>(null);
  const [currentFinger, setCurrentFinger] = useState<number | null>(null);
  const [currentImageNumber, setCurrentImageNumber] = useState<number | null>(null);

  // Stany dla algorytmu i wyników
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<"morphological" | "k3m">(
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

    // const imagePath = `/images/fingerprints/${hand == "left" ? "l" : "r"}${finger}_${imageNumber}.bmp`;
    const imagePath = `/images/fingerprints/test.png  `;

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

        // Resetuj wyniki poprzednich operacji
        setSkeletonImageData(null);
        setMinutiaeImageData(null);
        setMinutiaeStats(null);
      };
      img.onerror = () => {
        console.error(`Nie można załadować obrazu: ${imagePath}`);
        // Opcjonalnie: wyświetl komunikat o błędzie dla użytkownika
      };
      img.src = imagePath;
    }
  };

  // Losowe wybieranie obrazu
  const loadRandomImage = () => {
    setCurrentHand(Math.random() < 0.5 ? "left" : "right");
    setCurrentFinger(Math.floor(Math.random() * 5) + 1);
    setCurrentImageNumber(Math.floor(Math.random() * MAX_IMAGE_ID) + 1);
  };

  // Wykonaj szkieletyzację używając wybranego algorytmu
  const performSkeletonization = () => {
    if (!originalImageData) return;

    const { width, height, data } = originalImageData;
    let skeletonData = binarizeClampedArray(new Uint8ClampedArray(data), width, height, 30);
    // if (selectedAlgorithm === "morphological") {
    skeletonData = morphologicalThinning(skeletonData, width, height, 20);
    // } else {
    // skeletonData = k3mThinning(data, width, height);
    // }

    // Wyświetl wynik szkieletyzacji
    const imageData = new ImageData(new Uint8ClampedArray(skeletonData), width, height);
    setSkeletonImageData(imageData);

    // Wyczyść poprzednią detekcję minucji
    setMinutiaeImageData(null);
    setMinutiaeStats(null);
  };

  // // Popraw połączenia przerwanych linii
  // const improveConnections = () => {
  //   if (!skeletonImageData) return;

  //   const { width, height, data } = skeletonImageData;
  //   const improvedData = improveSkeletonConnections(data, width, height);

  //   // Aktualizuj obraz
  //   const imageData = new ImageData(new Uint8ClampedArray(improvedData), width, height);
  //   setSkeletonImageData(imageData);
  // };

  // // Wykryj minucje (cechy charakterystyczne)
  // const detectAndVisualizeMinutiae = () => {
  //   if (!skeletonImageData) return;

  //   const { width, height, data } = skeletonImageData;

  //   // Wykryj minucje
  //   const minutiae = detectMinutiae(data, width, height);

  //   // Zapisz statystyki
  //   setMinutiaeStats({
  //     endings: minutiae.endings.length,
  //     bifurcations: minutiae.bifurcations.length,
  //     cores: minutiae.cores.length,
  //     deltas: minutiae.deltas.length,
  //   });

  //   // Wizualizacja minucji
  //   const visualizedData = visualizeMinutiae(data, width, height, minutiae);
  //   const imageData = new ImageData(new Uint8ClampedArray(visualizedData), width, height);
  //   setMinutiaeImageData(imageData);
  // };

  // Załaduj obraz, gdy zmienią się parametry wyboru
  useEffect(() => {
    loadImage(currentHand, currentFinger, currentImageNumber);
  }, [currentHand, currentFinger, currentImageNumber]);

  // Aktualizuj canvas oryginalnego obrazu
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

  // Aktualizuj canvas, gdy zmieni się obraz szkieletu
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

  // Aktualizuj canvas, gdy zmieni się obraz minucji
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

            <div className="flex gap-4 mb-2">
              <div className="flex flex-col gap-2">
                <span className="text-gray-300">Wybierz algorytm:</span>
                <div className="flex gap-2">
                  <Button
                    label="Szkieletyzacja morfologiczna"
                    onClick={() => setSelectedAlgorithm("morphological")}
                    className={selectedAlgorithm === "morphological" ? "bg-blue-700" : ""}
                  />
                  <Button
                    label="Algorytm K3M"
                    onClick={() => setSelectedAlgorithm("k3m")}
                    className={selectedAlgorithm === "k3m" ? "bg-blue-700" : ""}
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button label="Wykonaj szkieletyzację" onClick={performSkeletonization} />
              </div>
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

              {/* <div className="flex gap-2 mt-2">
                <Button label="Popraw połączenia" onClick={improveConnections} />
                <Button label="Wykryj minucje" onClick={detectAndVisualizeMinutiae} />
              </div> */}
            </div>

            {minutiaeImageData && (
              <div className="flex flex-col gap-2 w-full md:w-1/2">
                <h3 className="text-lg font-medium">Wykryte minucje</h3>
                <canvas ref={minutiaeCanvasRef} className="w-full border border-gray-600 rounded" />

                {minutiaeStats && (
                  <div className="grid grid-cols-2 gap-2 mt-2 bg-gray-700 p-3 rounded">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 mr-2 rounded-full"></div>
                      <span className="text-gray-300">Zakończenia: {minutiaeStats.endings}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 mr-2 rounded-full"></div>
                      <span className="text-gray-300">
                        Bifurkacje: {minutiaeStats.bifurcations}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 mr-2"></div>
                      <span className="text-gray-300">Rdzenie: {minutiaeStats.cores}</span>
                    </div>
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 bg-yellow-500 mr-2"
                        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
                      ></div>
                      <span className="text-gray-300">Delty: {minutiaeStats.deltas}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
