import { FC, PropsWithChildren, useState } from "react";
import { TImage, ImageContext } from "../utils/useImage";

export const ImageProvider: FC<PropsWithChildren> = ({ children }) => {
  const [images, setImages] = useState<TImage[]>([]);

  const addImage = (imagePath: string) => {
    setImages((prevImages) => [
      ...prevImages,
      {
        path: imagePath,
        id: new Date().getTime().toString(),
        brightness: 100,
        contrast: 100,
        isGrayscale: false,
        isNegative: false,
        threshold: null,
      },
    ]);
  };

  const removeImage = (id: string) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  return (
    <ImageContext.Provider value={{ addImage, removeImage, images }}>
      {children}
    </ImageContext.Provider>
  );
};
