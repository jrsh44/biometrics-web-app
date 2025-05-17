import { negation } from "./manipulate";

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
): Uint8ClampedArray => {
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
): Uint8ClampedArray => {
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
): Uint8ClampedArray => {
  const eroded = erode(data, width, height, kernel);
  return dilate(eroded, width, height, kernel);
};

export const close = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[][],
): Uint8ClampedArray => {
  const dilated = dilate(data, width, height, kernel);
  return erode(dilated, width, height, kernel);
};

export const findRepresentativePoint = (repPoint: number[][]): [number, number] => {
  for (let i = 0; i < repPoint.length; i++) {
    for (let j = 0; j < repPoint[0].length; j++) {
      if (repPoint[i][j] === 1) {
        return [i, j];
      }
    }
  }

  return [Math.floor(repPoint.length / 2), Math.floor(repPoint[0].length / 2)];
};

export const padImage = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  padding: number,
  padValue: number = 0,
): { data: Uint8ClampedArray; width: number; height: number } => {
  const paddedWidth = width + 2 * padding;
  const paddedHeight = height + 2 * padding;
  const paddedData = new Uint8ClampedArray(paddedWidth * paddedHeight * 4);

  for (let i = 0; i < paddedData.length; i += 4) {
    paddedData[i] = paddedData[i + 1] = paddedData[i + 2] = padValue;
    paddedData[i + 3] = 255;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const dstIdx = ((y + padding) * paddedWidth + (x + padding)) * 4;

      paddedData[dstIdx] = paddedData[dstIdx + 1] = paddedData[dstIdx + 2] = data[srcIdx];
      paddedData[dstIdx + 3] = 255;
    }
  }

  return { data: paddedData, width: paddedWidth, height: paddedHeight };
};

export const dilateWithRep = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  se: number[][],
  repPoint: number[][],
): Uint8ClampedArray => {
  const negatedData = negation(data);

  const [repI, repJ] = findRepresentativePoint(repPoint);

  const m = se.length;
  const n = se[0].length;
  const pad = Math.max(repI, repJ, m - 1 - repI, n - 1 - repJ);

  const { data: paddedData, width: paddedWidth } = padImage(negatedData, width, height, pad, 0);

  const result = new Uint8ClampedArray(paddedData.length);
  for (let i = 0; i < result.length; i++) {
    result[i] = 0;
  }

  for (let i = 0; i < se.length; i++) {
    for (let j = 0; j < se[0].length; j++) {
      if (se[i][j] === 1) {
        const di = repI - i;
        const dj = repJ - j;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const srcY = y + pad + di;
            const srcX = x + pad + dj;

            if (srcY >= 0 && srcY < paddedWidth && srcX >= 0 && srcX < paddedWidth) {
              const srcIdx = (srcY * paddedWidth + srcX) * 4;
              const dstIdx = ((y + pad) * paddedWidth + (x + pad)) * 4;

              if (paddedData[srcIdx] > 0) {
                result[dstIdx] = result[dstIdx + 1] = result[dstIdx + 2] = 255;
              }
            }
          }
        }
      }
    }
  }

  const finalResult = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = ((y + pad) * paddedWidth + (x + pad)) * 4;
      const dstIdx = (y * width + x) * 4;

      finalResult[dstIdx] = finalResult[dstIdx + 1] = finalResult[dstIdx + 2] = result[srcIdx];
      finalResult[dstIdx + 3] = 255;
    }
  }

  return negation(finalResult);
};

export const erodeWithRep = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  se: number[][],
  repPoint: number[][],
): Uint8ClampedArray => {
  const negatedData = negation(data);

  const [repI, repJ] = findRepresentativePoint(repPoint);

  const m = se.length;
  const n = se[0].length;
  const pad = Math.max(repI, repJ, m - 1 - repI, n - 1 - repJ);

  const { data: paddedData, width: paddedWidth } = padImage(negatedData, width, height, pad, 0);

  const accumulator = new Int32Array(paddedData.length / 4);

  let count = 0;
  for (let i = 0; i < se.length; i++) {
    for (let j = 0; j < se[0].length; j++) {
      if (se[i][j] === 1) {
        count++;
      }
    }
  }

  for (let i = 0; i < se.length; i++) {
    for (let j = 0; j < se[0].length; j++) {
      if (se[i][j] === 1) {
        const di = i - repI;
        const dj = j - repJ;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const targetY = y + pad;
            const targetX = x + pad;
            const srcY = targetY + di;
            const srcX = targetX + dj;

            if (srcY >= 0 && srcY < paddedWidth && srcX >= 0 && srcX < paddedWidth) {
              const srcIdx = (srcY * paddedWidth + srcX) * 4;
              const accIdx = targetY * paddedWidth + targetX;

              if (paddedData[srcIdx] > 0) {
                accumulator[accIdx]++;
              }
            }
          }
        }
      }
    }
  }

  const result = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const accIdx = (y + pad) * paddedWidth + (x + pad);
      const dstIdx = (y * width + x) * 4;

      const isObject = accumulator[accIdx] === count;
      result[dstIdx] = result[dstIdx + 1] = result[dstIdx + 2] = isObject ? 0 : 255;
      result[dstIdx + 3] = 255;
    }
  }

  return result;
};

export const openWithRep = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  se: number[][],
  repPoint: number[][],
): Uint8ClampedArray => {
  const eroded = erodeWithRep(data, width, height, se, repPoint);
  return dilateWithRep(eroded, width, height, se, repPoint);
};

export const closeWithRep = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  se: number[][],
  repPoint: number[][],
): Uint8ClampedArray => {
  const dilated = dilateWithRep(data, width, height, se, repPoint);
  return erodeWithRep(dilated, width, height, se, repPoint);
};
