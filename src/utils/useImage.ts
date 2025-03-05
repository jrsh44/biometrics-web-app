import { createContext, useContext } from "react";

export type TImage = {
  id: string;
  path: string;
  brightness: number | null;
  contrast: number | null;
  threshold: number | null;
  isNegative: boolean | null;
  isGrayscale: boolean | null;
};

interface IImageContext {
  addImage: (image: string) => void;
  removeImage: (id: string) => void;
  images: TImage[];
}

export const ImageContext = createContext<IImageContext>({
  addImage: () => {},
  removeImage: () => {},
  images: [],
});

export const useImage = () => useContext(ImageContext);
