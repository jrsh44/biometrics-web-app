import { useRef, useState } from "react";
import { ImageManipulation } from "./components/ImageManipulation";

export const App = () => {
  const [image, setImage] = useState<string | null>(null);
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
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col w-full gap-4 p-4">
      <h1 className="text-2xl font-bold">Przetwarzanie obrazu</h1>
      <div className="flex flex-col w-full gap-2">
        <h2 className="text-xl font-semibold">Oryginalny obraz</h2>

        <input
          ref={imageInputRef}
          className="hidden"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />

        <div
          className={`flex flex-col border-2 rounded-xl p-4 ${
            isDragging ? "border-amber-400" : "border-gray-600"
          } border-dashed w-full h-[400px] items-center justify-center text-gray-600 transition-all`}
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
          {image ? (
            <div className="flex items-center justify-center w-full h-full">
              <img
                src={image}
                alt="Załadowany obraz"
                className="max-w-full max-h-full object-contain border-4 border-solid border-gray-600"
              />
            </div>
          ) : (
            <p className="text-center">
              Przeciągnij obraz tutaj lub{" "}
              <button
                className="underline underline-offset-1 cursor-pointer hover:underline-offset-4 hover:text-gray-400"
                onClick={() => imageInputRef.current?.click()}
              >
                wybierz go z dysku
              </button>
            </p>
          )}
        </div>
      </div>
      <ImageManipulation image={image} />
    </div>
  );
};
