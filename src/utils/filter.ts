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

  for (let y = 0; y < height - 1; y++) {
    for (let x = 0; x < width - 1; x++) {
      let [gx, gy] = [0, 0];

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const pixelIndex = ((y + ky) * width + (x + kx)) * 4;
          gx += tempData[pixelIndex] * kernelX[ky][kx];
          gy += tempData[pixelIndex] * kernelY[ky][kx];
        }
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

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let [gx, gy] = [0, 0];

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const pixelIndex = ((y + ky - 1) * width + (x + kx - 1)) * 4;
          gx += tempData[pixelIndex] * kernelX[ky][kx];
          gy += tempData[pixelIndex] * kernelY[ky][kx];
        }
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
