import { FC, PropsWithChildren, useState } from "react";
import { TImage, ImageContext } from "../utils/useImage";
import { TApplyFilter } from "../utils/filter";

export const ImageProvider: FC<PropsWithChildren> = ({ children }) => {
  const [images, setImages] = useState<TImage[]>([]);

  const addImage = (imagePath: string) => {
    const img = new Image();
    img.src = imagePath;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        const id = new Date().getTime().toString();
        setImages((prevImages) => [
          ...prevImages,
          {
            id,
            data,
            path: imagePath,
            width: img.width,
            height: img.height,
            brightness: 100,
            contrast: 100,
            isGrayscale: false,
            isNegative: false,
            threshold: null,
          },
        ]);
      }
    };
  };

  const removeImage = (id: string) => {
    setImages((prevImages) => prevImages.filter((image) => image.id !== id));
  };

  const revertImage = (id: string) => {
    const image = images.find((image) => image.id === id);
    if (!image) return;

    const img = new Image();
    img.src = image.path;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imageData.data;
        setImages((prevImages) =>
          prevImages.map((image) =>
            image.id === id
              ? {
                  id: image.id,
                  data,
                  path: image.path,
                  width: img.width,
                  height: img.height,
                  brightness: 100,
                  contrast: 100,
                  isGrayscale: false,
                  isNegative: false,
                  threshold: null,
                }
              : image,
          ),
        );
      }
    };
  };

  const changeBrightness = (id: string, value: number | null) => {
    setImages((prevImages) =>
      prevImages.map((image) => (image.id === id ? { ...image, brightness: value } : image)),
    );
  };

  const changeContrast = (id: string, value: number | null) => {
    setImages((prevImages) =>
      prevImages.map((image) => (image.id === id ? { ...image, contrast: value } : image)),
    );
  };

  const changeThreshold = (id: string, value: number | null) => {
    setImages((prevImages) =>
      prevImages.map((image) => (image.id === id ? { ...image, threshold: value } : image)),
    );
  };

  const changeNegative = (id: string, value: boolean | null) => {
    setImages((prevImages) =>
      prevImages.map((image) => (image.id === id ? { ...image, isNegative: value } : image)),
    );
  };

  const changeGrayscale = (id: string, value: boolean | null) => {
    setImages((prevImages) =>
      prevImages.map((image) => (image.id === id ? { ...image, isGrayscale: value } : image)),
    );
  };

  const applyFilter = (id: string, filter: TApplyFilter, kernel: number[][]) => {
    setImages((prevImages) => {
      const image = prevImages.find((image) => image.id === id);
      if (!image) return prevImages;
      const tempData = new Uint8ClampedArray(image.data);
      const data = filter(tempData, image.width, image.height, kernel);
      return prevImages.map((image) => (image.id === id ? { ...image, data } : image));
    });
  };

  return (
    <ImageContext.Provider
      value={{
        addImage,
        applyFilter,
        changeBrightness,
        changeContrast,
        changeThreshold,
        changeNegative,
        changeGrayscale,
        images,
        removeImage,
        revertImage,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
