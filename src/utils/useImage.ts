import { createContext, useContext } from "react";
import { TApplyFilter } from "./filter";

export type TImage = {
  id: string;
  path: string;
  data: Uint8ClampedArray;
  width: number;
  height: number;
  brightness: number | null;
  contrast: number | null;
  threshold: number | null;
  isNegative: boolean | null;
  isGrayscale: boolean | null;
};

interface IImageContext {
  addImage: (imagePath: string) => void;
  removeImage: (id: string) => void;
  revertImage: (id: string) => void;
  changeBrightness: (id: string, value: number | null) => void;
  changeContrast: (id: string, value: number | null) => void;
  changeThreshold: (id: string, value: number | null) => void;
  changeNegative: (id: string, value: boolean | null) => void;
  changeGrayscale: (id: string, value: boolean | null) => void;
  applyFilter: (id: string, filter: TApplyFilter, kernels: number[][][]) => void;
  images: TImage[];
}

export const ImageContext = createContext<IImageContext>({
  addImage: () => {},
  removeImage: () => {},
  revertImage: () => {},
  changeBrightness: () => {},
  changeContrast: () => {},
  changeThreshold: () => {},
  changeNegative: () => {},
  changeGrayscale: () => {},
  applyFilter: () => {},
  images: [],
});

export const useImage = () => useContext(ImageContext);
