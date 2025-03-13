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

export const applyCannyFilter: TApplyFilter = (data, width, height) => {
  const conv2D = (img: number[][], kernel: number[][]): number[][] => {
    const h = img.length;
    const w = img[0].length;
    const k = kernel.length;
    const pad = Math.floor(k / 2);

    const paddedImg = Array.from({ length: h + 2 * pad }, (_, i) =>
      Array.from({ length: w + 2 * pad }, (_, j) =>
        i >= pad && i < h + pad && j >= pad && j < w + pad ? img[i - pad][j - pad] : 0,
      ),
    );

    const result: number[][] = Array.from({ length: h }, () => Array(w).fill(0));

    for (let i = pad; i < h + pad; i++) {
      for (let j = pad; j < w + pad; j++) {
        let sum = 0;
        for (let ki = 0; ki < k; ki++) {
          for (let kj = 0; kj < k; kj++) {
            sum += paddedImg[i - pad + ki][j - pad + kj] * kernel[ki][kj];
          }
        }
        result[i - pad][j - pad] = sum;
      }
    }

    return result;
  };

  const sobelFilter = (img: number[][]) => {
    const kx = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1],
    ];
    const ky = [
      [1, 2, 1],
      [0, 0, 0],
      [-1, -2, -1],
    ];

    const gx = conv2D(img, kx);
    const gy = conv2D(img, ky);

    const g = gx.map((row, i) => row.map((val, j) => Math.hypot(val, gy[i][j])));
    const theta = gx.map((row, i) => row.map((val, j) => Math.atan2(gy[i][j], val)));

    return { gx, gy, g, theta };
  };

  const nms = (g: number[][], theta: number[][]): number[][] => {
    const h = g.length;
    const w = g[0].length;
    const result = Array.from({ length: h }, () => Array(w).fill(0));

    for (let i = 1; i < h - 1; i++) {
      for (let j = 1; j < w - 1; j++) {
        const angle = ((theta[i][j] * 180) / Math.PI + 180) % 180;

        let q = 255;
        let r = 255;

        if ((angle >= 0 && angle < 22.5) || (angle >= 157.5 && angle <= 180)) {
          q = g[i][j + 1];
          r = g[i][j - 1];
        } else if (angle >= 22.5 && angle < 67.5) {
          q = g[i + 1][j - 1];
          r = g[i - 1][j + 1];
        } else if (angle >= 67.5 && angle < 112.5) {
          q = g[i + 1][j];
          r = g[i - 1][j];
        } else if (angle >= 112.5 && angle < 157.5) {
          q = g[i - 1][j - 1];
          r = g[i + 1][j + 1];
        }

        if (g[i][j] >= q && g[i][j] >= r) {
          result[i][j] = g[i][j];
        }
      }
    }

    return result;
  };

  const threshold = (
    img: number[][],
    low: number,
    high: number,
  ): { res: number[][]; weak: number; strong: number } => {
    const weak = 25;
    const strong = 255;

    const res = img.map((row) => row.map((val) => (val >= high ? strong : val >= low ? weak : 0)));

    return { res, weak, strong };
  };

  const hysteresis = (img: number[][], weak: number, strong: number): number[][] => {
    const h = img.length;
    const w = img[0].length;

    for (let i = 1; i < h - 1; i++) {
      for (let j = 1; j < w - 1; j++) {
        if (img[i][j] === weak) {
          if (
            [
              img[i - 1][j - 1],
              img[i - 1][j],
              img[i - 1][j + 1],
              img[i][j - 1],
              img[i][j + 1],
              img[i + 1][j - 1],
              img[i + 1][j],
              img[i + 1][j + 1],
            ].includes(strong)
          ) {
            img[i][j] = strong;
          } else {
            img[i][j] = 0;
          }
        }
      }
    }

    return img;
  };

  const grayscale = Array.from({ length: height }, (_, i) =>
    Array.from({ length: width }, (_, j) => data[(i * width + j) * 4]),
  );

  const { g, theta } = sobelFilter(grayscale);
  const suppressed = nms(g, theta);
  const { res, weak, strong } = threshold(suppressed, 50, 100);
  const final = hysteresis(res, weak, strong);

  const result = new Uint8ClampedArray(width * height * 4);

  final.flat().forEach((val, i) => {
    const offset = i * 4;
    result[offset] = result[offset + 1] = result[offset + 2] = val;
    result[offset + 3] = 255;
  });

  return result;
};
