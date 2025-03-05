export type TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[][],
) => Uint8ClampedArray;

export const defaultAverageKernel = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
];

export const applyAverageFilter: TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[][] = defaultAverageKernel,
): Uint8ClampedArray => {
  const tempData = new Uint8ClampedArray(data);
  const kernelSize = kernel.length;
  const kernelSum = kernel.flat().reduce((sum, value) => sum + value, 0);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const pixelIndex = ((y + ky - 1) * width + (x + kx - 1)) * 4;
          r += tempData[pixelIndex] * kernel[ky][kx];
          g += tempData[pixelIndex + 1] * kernel[ky][kx];
          b += tempData[pixelIndex + 2] * kernel[ky][kx];
        }
      }

      const index = (y * width + x) * 4;
      data[index] = r / kernelSum;
      data[index + 1] = g / kernelSum;
      data[index + 2] = b / kernelSum;
    }
  }

  return data;
};

export const defaultGaussianKernel = [
  [1, 2, 1],
  [2, 4, 2],
  [1, 2, 1],
];

export const applyGaussianFilter: TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[][] = defaultGaussianKernel,
): Uint8ClampedArray => {
  const tempData = new Uint8ClampedArray(data);
  const kernelSize = kernel.length;
  const kernelSum = kernel.flat().reduce((sum, value) => sum + value, 0);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const pixelIndex = ((y + ky - 1) * width + (x + kx - 1)) * 4;
          r += tempData[pixelIndex] * kernel[ky][kx];
          g += tempData[pixelIndex + 1] * kernel[ky][kx];
          b += tempData[pixelIndex + 2] * kernel[ky][kx];
        }
      }

      const index = (y * width + x) * 4;
      data[index] = r / kernelSum;
      data[index + 1] = g / kernelSum;
      data[index + 2] = b / kernelSum;
    }
  }

  return data;
};

export const defaultSharpenKernel = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0],
];

export const applySharpenFilter: TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[][] = defaultSharpenKernel,
): Uint8ClampedArray => {
  const tempData = new Uint8ClampedArray(data);
  const kernelSize = kernel.length;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0,
        g = 0,
        b = 0;

      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const pixelIndex = ((y + ky - 1) * width + (x + kx - 1)) * 4;
          r += tempData[pixelIndex] * kernel[ky][kx];
          g += tempData[pixelIndex + 1] * kernel[ky][kx];
          b += tempData[pixelIndex + 2] * kernel[ky][kx];
        }
      }

      const index = (y * width + x) * 4;
      data[index] = r;
      data[index + 1] = g;
      data[index + 2] = b;
    }
  }

  return data;
};
