import { useRef, useState } from "react";
import { ManipulationPanel } from "../components/manipulationPanel";
import { ImageInputText } from "../components/ui/ImageInputText";
import { useImage } from "../utils/useImage";
import { Button } from "../components/ui/Buttons";
import { LensPanel } from "../components/lensPanel/LensPanel";
import { SkeletonizationPanel } from "../components/skeletonizationPanel/SkeletonizationPanel";

export const App = () => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const { images, addImage } = useImage();
  const [isDragging, setIsDragging] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    let files: FileList | null = null;

    if ("dataTransfer" in event) {
      files = event.dataTransfer.files;
    } else {
      files = event.target.files;
    }

    if (files && files.length > 0) {
      const file = files[0];

      if (!file.type.startsWith("image/")) {
        alert("Proszę wybrać plik graficzny.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => setCurrentImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 p-4 h-dvh overflow-auto">
      <SkeletonizationPanel />
      <LensPanel />
      <h1 className="text-2xl font-bold">Przetwarzanie obrazu</h1>
      <div className="flex gap-8">
        <div className="flex flex-col max-w-[600px] min-w-[600px] gap-2">
          <div className="flex items-center justify-between w-full h-10">
            <h2 className="text-xl font-semibold">Oryginalny obraz</h2>
          </div>

          <input
            ref={imageInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />

          <div
            className={`flex flex-col border-2 rounded-[14px] p-2 min-h-[600px] gap-2 ${
              isDragging && !currentImage ? "border-amber-400" : "border-gray-600"
            } ${currentImage ? "border" : "border-dashed justify-center"} w-full items-center text-gray-600 transition-all`}
            onDragOver={(event) => {
              if (currentImage) return;
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => !currentImage && setIsDragging(false)}
            onDrop={(event) => {
              if (currentImage) return;
              event.preventDefault();
              setIsDragging(false);
              handleImageUpload(event);
            }}
          >
            {currentImage ? (
              <>
                <div>
                  <img
                    src={currentImage}
                    alt="Załadowany obraz"
                    className="max-w-[900px] max-h-[500px] w-full h-full object-contain rounded-t-md"
                  />
                </div>

                <Button
                  label="Dodaj nowy panel do przetwarzania obrazu"
                  onClick={() => addImage(currentImage)}
                />

                <div
                  className={`flex grow border-2 rounded-b-sm p-8 ${
                    isDragging ? "border-amber-400" : "border-gray-600"
                  } border-dashed justify-center w-full items-center text-gray-600 transition-all`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setIsDragging(false);
                    handleImageUpload(event);
                  }}
                >
                  <ImageInputText imageInputRef={imageInputRef} />
                </div>
              </>
            ) : (
              <ImageInputText imageInputRef={imageInputRef} />
            )}
          </div>
        </div>
        {images.length > 0 &&
          images.map((image) => (
            <ManipulationPanel key={`image-manipulation-${image.id}`} image={image} />
          ))}
      </div>
    </div>
  );
};
