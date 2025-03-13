export type TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernels: number[][][],
) => Uint8ClampedArray;

export const defaultAverageKernel = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
];

export const defaultGaussianKernel = [
  [1, 2, 1],
  [2, 4, 2],
  [1, 2, 1],
];

export const defaultSharpenKernel = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0],
];

export const applyWeightedMeanFilter: TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernels: number[][][],
): Uint8ClampedArray => {
  const kernel = kernels[0];
  const newData = new Uint8ClampedArray(data);
  const kernelSize = kernel.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let [r, g, b, countR, countG, countB] = [0, 0, 0, 0, 0, 0];

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const ny = y + ky - Math.floor(kernelSize / 2);
          const nx = x + kx - Math.floor(kernelSize / 2);

          if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue;
          const pixelIndex = (ny * width + nx) * 4;

          r += data[pixelIndex] * kernel[ky][kx];
          g += data[pixelIndex + 1] * kernel[ky][kx];
          b += data[pixelIndex + 2] * kernel[ky][kx];
          countR += kernel[ky][kx];
          countG += kernel[ky][kx];
          countB += kernel[ky][kx];
        }
      }

      const index = (y * width + x) * 4;
      newData[index] = r / countR;
      newData[index + 1] = g / countG;
      newData[index + 2] = b / countB;
    }
  }

  return newData;
};

export const defaultRobertsCrossKernelX = [
  [1, 0],
  [0, -1],
];

export const defaultRobertsCrossKernelY = [
  [0, 1],
  [-1, 0],
];

export const applyRobertsCrossFilter: TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernels: number[][][] = [defaultRobertsCrossKernelX, defaultRobertsCrossKernelY],
): Uint8ClampedArray => {
  const kernelX = kernels[0];
  const kernelY = kernels[1];
  const tempData = new Uint8ClampedArray(data);
  const kernelSize = kernelX.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let [gx, gy] = [0, 0];
      let shouldBreak = false;

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const ny = y + ky - Math.floor((kernelSize - 1) / 2);
          const nx = x + kx - Math.floor((kernelSize - 1) / 2);

          if (ny < 0 || ny >= height || nx < 0 || nx >= width) {
            gx = 0;
            gy = 0;
            shouldBreak = true;
            break;
          }
          const pixelIndex = (ny * width + nx) * 4;

          // const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
          gx += tempData[pixelIndex] * kernelX[ky][kx];
          gy += tempData[pixelIndex] * kernelY[ky][kx];
        }
        if (shouldBreak) break;
      }

      const index = (y * width + x) * 4;
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      data[index] = magnitude;
      data[index + 1] = magnitude;
      data[index + 2] = magnitude;
    }
  }

  return data;
};

export const defaultSobelKernelX = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

export const defaultSobelKernelY = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
];

export const applySobelFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernels: number[][][] = [defaultSobelKernelX, defaultSobelKernelY],
): Uint8ClampedArray => {
  const kernelX = kernels[0];
  const kernelY = kernels[1];
  const tempData = new Uint8ClampedArray(data);
  const kernelSize = kernelX.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let [gx, gy] = [0, 0];
      let shouldBreak = false;

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const ny = y + ky - Math.floor((kernelSize - 1) / 2);
          const nx = x + kx - Math.floor((kernelSize - 1) / 2);

          if (ny < 0 || ny >= height || nx < 0 || nx >= width) {
            gx = 0;
            gy = 0;
            shouldBreak = true;
            break;
          }
          const pixelIndex = (ny * width + nx) * 4;

          // const pixelIndex = ((y + ky - 1) * width + (x + kx - 1)) * 4;
          gx += tempData[pixelIndex] * kernelX[ky][kx];
          gy += tempData[pixelIndex] * kernelY[ky][kx];
        }
        if (shouldBreak) break;
      }

      const index = (y * width + x) * 4;
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      data[index] = magnitude;
      data[index + 1] = magnitude;
      data[index + 2] = magnitude;
    }
  }

  return data;
};

export const getGradientFromSobelFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernels: number[][][] = [defaultSobelKernelX, defaultSobelKernelY],
): { gradientX: Uint8ClampedArray; gradientY: Uint8ClampedArray } => {
  const kernelX = kernels[0];
  const kernelY = kernels[1];
  const gradientX = new Uint8ClampedArray(data.length);
  const gradientY = new Uint8ClampedArray(data.length);
  const kernelSize = kernelX.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let [gx, gy] = [0, 0];
      let shouldBreak = false;

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const ny = y + ky - Math.floor((kernelSize - 1) / 2);
          const nx = x + kx - Math.floor((kernelSize - 1) / 2);

          if (ny < 0 || ny >= height || nx < 0 || nx >= width) {
            gx = 0;
            gy = 0;
            shouldBreak = true;
            break;
          }
          const pixelIndex = (ny * width + nx) * 4;

          gx += data[pixelIndex] * kernelX[ky][kx];
          gy += data[pixelIndex] * kernelY[ky][kx];
        }
        if (shouldBreak) break;
      }

      const index = (y * width + x) * 4;
      gradientX[index] = gx;
      gradientX[index + 1] = gx;
      gradientX[index + 2] = gx;
      gradientY[index] = gy;
      gradientY[index + 1] = gy;
      gradientY[index + 2] = gy;
    }
  }

  return { gradientX, gradientY };
};

export const applyCannyFilter: TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernels = [defaultGaussianKernel],
): Uint8ClampedArray => {
  
  // 1
  const blurredData = applyWeightedMeanFilter(data, width, height, kernels);

  // 2
  const { gradientX, gradientY } = getGradientFromSobelFilter(blurredData, width, height);

  // 3.
  const magnitude = new Uint8ClampedArray(width * height);
  const direction = new Uint8ClampedArray(width * height);
  for (let i = 0; i < width * height; i++) {
    const gx = gradientX[i * 4];
    const gy = gradientY[i * 4];
    magnitude[i] = Math.sqrt(gx * gx + gy * gy);
    direction[i] = Math.atan2(gy, gx);
  }

  // 4.
  const suppressed = new Uint8ClampedArray(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const angle = direction[i];
      let q = 255;
      let r = 255;

      if (
        (angle > -Math.PI / 8 && angle <= Math.PI / 8) ||
        (angle > (7 * Math.PI) / 8 && angle <= Math.PI) ||
        (angle >= -Math.PI && angle <= (-7 * Math.PI) / 8)
      ) {
        q = magnitude[y * width + (x + 1)];
        r = magnitude[y * width + (x - 1)];
      } else if (
        (angle > Math.PI / 8 && angle <= (3 * Math.PI) / 8) ||
        (angle > (-7 * Math.PI) / 8 && angle <= (-5 * Math.PI) / 8)
      ) {
        q = magnitude[(y + 1) * width + (x - 1)];
        r = magnitude[(y - 1) * width + (x + 1)];
      } else if (
        (angle > (3 * Math.PI) / 8 && angle <= (5 * Math.PI) / 8) ||
        (angle > (-5 * Math.PI) / 8 && angle <= (-3 * Math.PI) / 8)
      ) {
        q = magnitude[(y + 1) * width + x];
        r = magnitude[(y - 1) * width + x];
      } else if (
        (angle > (5 * Math.PI) / 8 && angle <= (7 * Math.PI) / 8) ||
        (angle > (-3 * Math.PI) / 8 && angle <= -Math.PI / 8)
      ) {
        q = magnitude[(y - 1) * width + (x - 1)];
        r = magnitude[(y + 1) * width + (x + 1)];
      }

      if (magnitude[i] >= q && magnitude[i] >= r) {
        suppressed[i] = magnitude[i];
      } else {
        suppressed[i] = 0;
      }
    }
  }

  // 5.
  const thresholdLow = 10;
  const thresholdHigh = 100;
  const result = new Uint8ClampedArray(width * height * 4);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (suppressed[i] >= thresholdHigh) {
        result[i * 4] = 255;
        result[i * 4 + 1] = 255;
        result[i * 4 + 2] = 255;
        result[i * 4 + 3] = 255;
      } else if (suppressed[i] >= thresholdLow) {
        if (
          suppressed[(y + 1) * width + x] >= thresholdHigh ||
          suppressed[(y - 1) * width + x] >= thresholdHigh ||
          suppressed[y * width + (x + 1)] >= thresholdHigh ||
          suppressed[y * width + (x - 1)] >= thresholdHigh ||
          suppressed[(y + 1) * width + (x + 1)] >= thresholdHigh ||
          suppressed[(y + 1) * width + (x - 1)] >= thresholdHigh ||
          suppressed[(y - 1) * width + (x + 1)] >= thresholdHigh ||
          suppressed[(y - 1) * width + (x - 1)] >= thresholdHigh
        ) {
          result[i * 4] = 255;
          result[i * 4 + 1] = 255;
          result[i * 4 + 2] = 255;
          result[i * 4 + 3] = 255;
        }
      }
    }
  }

  return result;
};
