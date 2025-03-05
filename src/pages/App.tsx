import { useRef, useState } from "react";
import { ImageManipulation } from "../components/ImageManipulation";
import { ImageInputText } from "../components/ui/ImageInputText";
import { useImage } from "../utils/useImage";

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
      reader.onloadend = () => {
        setCurrentImage(reader.result as string);
        addImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 p-4">
      <h1 className="text-2xl font-bold">Przetwarzanie obrazu</h1>
      <div className="flex gap-4 overflow-x-auto">
        <div className="flex flex-col max-w-[600px] min-w-[400px] gap-2">
          <h2 className="text-xl font-semibold">Oryginalny obraz</h2>

          <input
            ref={imageInputRef}
            className="hidden"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />

          <div
            className={`flex flex-col border-2 rounded-[14px] p-2 min-h-[500px] gap-2 ${
              isDragging && !currentImage ? "border-amber-400" : "border-gray-600"
            } ${currentImage ? "border" : "border-dashed justify-center"} w-full items-center text-gray-600 transition-all`}
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
            {currentImage ? (
              <>
                <div>
                  <img
                    src={currentImage}
                    alt="Załadowany obraz"
                    className="max-w-[900px] max-h-[500px] w-full h-full object-contain rounded-t-md"
                  />
                </div>

                <button
                  className="flex w-full justify-center border-2 p-4 text-slate-200 border-gray-600 hover:border-slate-200 transition-all cursor-pointer"
                  onClick={() => addImage(currentImage)}
                >
                  <p className="text-center">Dodaj nowy panel do przetwarzania obrazu</p>
                </button>

                <button
                  className={`flex flex-col border-2 rounded-b-sm p-8   ${
                    isDragging ? "border-amber-400" : "border-gray-600"
                  }" border-dashed justify-center w-full items-center text-gray-600 transition-all`}
                >
                  <ImageInputText imageInputRef={imageInputRef} />
                </button>
              </>
            ) : (
              <ImageInputText imageInputRef={imageInputRef} />
            )}
          </div>
        </div>
        {images.length > 0 &&
          images.map((image, idx) => (
            <ImageManipulation key={`image-manipulation-${idx}`} image={image} />
          ))}
      </div>
    </div>
  );
};
