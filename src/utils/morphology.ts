export enum EMorphology {
  Erode = "erode",
  Dilate = "dilate",
  Open = "open",
  Close = "close",
}

export const defaultSquareKernel = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
];

export const erode = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[][],
) => {
  const result = new Uint8ClampedArray(data.length);

  const kernelHeight = kernel.length;
  const kernelWidth = kernel[0].length;
  const kernelCenterY = Math.floor(kernelHeight / 2);
  const kernelCenterX = Math.floor(kernelWidth / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 4; c++) {
        let minVal = 255;

        for (let ky = 0; ky < kernelHeight; ky++) {
          for (let kx = 0; kx < kernelWidth; kx++) {
            if (kernel[ky][kx] === 0) continue;

            const pixelY = y + (ky - kernelCenterY);
            const pixelX = x + (kx - kernelCenterX);

            if (pixelY >= 0 && pixelY < height && pixelX >= 0 && pixelX < width) {
              const idx = (pixelY * width + pixelX) * 4 + c;
              minVal = Math.min(minVal, data[idx]);
            }
          }
        }

        const i = (y * width + x) * 4 + c;
        result[i] = minVal;
      }
    }
  }

  return result;
};

export const dilate = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[][],
) => {
  const result = new Uint8ClampedArray(data.length);

  const kernelHeight = kernel.length;
  const kernelWidth = kernel[0].length;
  const kernelCenterY = Math.floor(kernelHeight / 2);
  const kernelCenterX = Math.floor(kernelWidth / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let c = 0; c < 4; c++) {
        let maxVal = 0;

        for (let ky = 0; ky < kernelHeight; ky++) {
          for (let kx = 0; kx < kernelWidth; kx++) {
            if (kernel[ky][kx] === 0) continue;

            const pixelY = y + (ky - kernelCenterY);
            const pixelX = x + (kx - kernelCenterX);

            if (pixelY >= 0 && pixelY < height && pixelX >= 0 && pixelX < width) {
              const idx = (pixelY * width + pixelX) * 4 + c;
              maxVal = Math.max(maxVal, data[idx]);
            }
          }
        }

        const i = (y * width + x) * 4 + c;
        result[i] = maxVal;
      }
    }
  }

  return result;
};

export const open = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[][],
) => {
  const eroded = erode(data, width, height, kernel);
  return dilate(eroded, width, height, kernel);
};

export const close = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[][],
) => {
  const dilated = dilate(data, width, height, kernel);
  return erode(dilated, width, height, kernel);
};
