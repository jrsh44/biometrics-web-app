import { defaultGaussianKernel, defaultSobelKernelX, defaultSobelKernelY } from "../consts/kernels";

export type TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernels: number[][][],
) => Uint8ClampedArray;

export const applyWeightedMeanFilter: TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernels: number[][][],
): Uint8ClampedArray => {
  const kernel = kernels[0];
  const newData = new Uint8ClampedArray(data);
  const kernelSize = kernel.length;

  // Iteracja po każdym pikselu obrazu
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let [r, g, b, weight] = [0, 0, 0, 0];

      // Iteracja po każdym elemencie jądra
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          // Obliczenie współrzędnych sąsiedniego piksela
          const ny = y + ky - Math.floor(kernelSize / 2);
          const nx = x + kx - Math.floor(kernelSize / 2);

          // Sprawdzenie, czy sąsiedni piksel znajduje się w granicach obrazu
          if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue;
          // Obliczenie indeksu sąsiedniego piksela w tablicy danych
          const pixelIndex = (ny * width + nx) * 4;

          // Dodanie wartości piksela pomnożonej przez wagę jądra do sumy
          r += data[pixelIndex] * kernel[ky][kx];
          g += data[pixelIndex + 1] * kernel[ky][kx];
          b += data[pixelIndex + 2] * kernel[ky][kx];

          // Dodanie wagi jądra do sumy wag
          weight += kernel[ky][kx];
        }
      }

      // Obliczenie indeksu piksela w tablicy danych
      const index = (y * width + x) * 4;
      // Ustawienie wartości piksela na średnią ważoną (dla kanałów R, G, B)
      newData[index] = r / weight;
      newData[index + 1] = g / weight;
      newData[index + 2] = b / weight;
    }
  }

  return newData;
};

const getDirectionalGradient = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernelX: number[][],
  kernelY: number[][],
): { gx: number[][]; gy: number[][] } => {
  const kernelSize = kernelX.length;
  const pad = Math.floor(kernelSize / 2);

  // Konwersja obrazu na skalę szarości
  const grayscale = Array.from({ length: height }, (_, i) =>
    Array.from({ length: width }, (_, j) => data[(i * width + j) * 4]),
  );

  // Dodanie paddingu do obrazu
  const paddedImg = Array.from({ length: height + 2 * pad }, (_, i) =>
    Array.from({ length: width + 2 * pad }, (_, j) =>
      i >= pad && i < height + pad && j >= pad && j < width + pad ? grayscale[i - pad][j - pad] : 0,
    ),
  );

  // Inicjalizacja tablic gradientów gx i gy
  const gx = Array.from({ length: height }, () => Array(width).fill(0));
  const gy = Array.from({ length: height }, () => Array(width).fill(0));

  // Obliczanie gradientów gx i gy za pomocą podanych jąder
  for (let i = pad; i < height + pad; i++) {
    for (let j = pad; j < width + pad; j++) {
      for (let ki = 0; ki < kernelSize; ki++) {
        for (let kj = 0; kj < kernelSize; kj++) {
          gx[i - pad][j - pad] += paddedImg[i - pad + ki][j - pad + kj] * kernelX[ki][kj];
          gy[i - pad][j - pad] += paddedImg[i - pad + ki][j - pad + kj] * kernelY[ki][kj];
        }
      }
    }
  }

  return { gx, gy };
};

export const applyDirectionalFilter: TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernels: number[][][],
): Uint8ClampedArray => {
  // Uzyskanie gradientów gx i gy
  const { gx, gy } = getDirectionalGradient(data, width, height, kernels[0], kernels[1]);

  // Iteracja po każdym pikselu obrazu, obliczenie wielkości gradientu i ustawienie wartości piksela
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const magnitude = Math.sqrt(gx[y][x] * gx[y][x] + gy[y][x] * gy[y][x]);
      data[index] = magnitude;
      data[index + 1] = magnitude;
      data[index + 2] = magnitude;
    }
  }

  return data;
};

export const applyCannyFilter: TApplyFilter = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernels: number[][][] = [defaultGaussianKernel, defaultSobelKernelX, defaultSobelKernelY],
): Uint8ClampedArray => {
  // Zastosowanie filtru Gaussa
  const newData = applyWeightedMeanFilter(data, width, height, [kernels[0]]);

  // Uzyskanie gradientów gx i gy za pomocą funkcji getDirectionalGradient
  const { gx, gy } = getDirectionalGradient(newData, width, height, kernels[1], kernels[2]);

  // Obliczanie wielkości gradientu i kąta
  const g = gx.map((row, i) => row.map((val, j) => Math.hypot(val, gy[i][j])));
  const theta = gx.map((row, i) => row.map((val, j) => Math.atan2(gy[i][j], val)));

  // Inicjalizacja tablicy do supresji nielokalnych maksimów
  const suppressed = Array.from({ length: height }, () => Array(width).fill(0));

  // Supresja nielokalnych maksimów
  for (let i = 1; i < height - 1; i++) {
    for (let j = 1; j < width - 1; j++) {
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
        suppressed[i][j] = g[i][j];
      }
    }
  }

  // Definiowanie progów i wartości dla słabych i silnych krawędzi
  const weak = 25;
  const strong = 255;
  const low = 50;
  const high = 100;

  // Progowanie dwustopniowe
  const thresholded = suppressed.map((row) =>
    row.map((val) => (val >= high ? strong : val >= low ? weak : 0)),
  );

  // Histereza
  for (let i = 1; i < height - 1; i++) {
    for (let j = 1; j < width - 1; j++) {
      if (thresholded[i][j] === weak) {
        if (
          [
            thresholded[i - 1][j - 1],
            thresholded[i - 1][j],
            thresholded[i - 1][j + 1],
            thresholded[i][j - 1],
            thresholded[i][j + 1],
            thresholded[i + 1][j - 1],
            thresholded[i + 1][j],
            thresholded[i + 1][j + 1],
          ].includes(strong)
        ) {
          thresholded[i][j] = strong;
        } else {
          thresholded[i][j] = 0;
        }
      }
    }
  }

  // Tworzenie wyniku jako Uint8ClampedArray
  const result = new Uint8ClampedArray(width * height * 4);

  // Przekształcanie tablicy progowanej na wynikowy obraz
  thresholded.flat().forEach((val, i) => {
    const offset = i * 4;
    result[offset] = result[offset + 1] = result[offset + 2] = val;
    result[offset + 3] = 255;
  });

  return result;
};

function gaborKernel(
  kernelSize: number,
  sigma: number,
  theta: number,
  lambda: number,
  gamma: number = 0.5,
  psi: number = 0,
): number[][] {
  const half = Math.floor(kernelSize / 2);
  const kernel = Array(kernelSize)
    .fill(null)
    .map(() => Array(kernelSize).fill(0));

  for (let y = -half; y <= half; y++) {
    for (let x = -half; x <= half; x++) {
      const xTheta = x * Math.cos(theta) + y * Math.sin(theta);
      const yTheta = -x * Math.sin(theta) + y * Math.cos(theta);
      const gb =
        Math.exp(-(xTheta ** 2 + gamma ** 2 * yTheta ** 2) / (2 * sigma ** 2)) *
        Math.cos((2 * Math.PI * xTheta) / lambda + psi);
      kernel[y + half][x + half] = gb;
    }
  }
  return kernel;
}

function convolve2D(image: number[][], kernel: number[][]): number[][] {
  const imageHeight = image.length;
  const imageWidth = image[0].length;
  const kernelSize = kernel.length;
  const kernelHalf = Math.floor(kernelSize / 2);
  const result = Array(imageHeight)
    .fill(null)
    .map(() => Array(imageWidth).fill(0));

  for (let y = 0; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      let sum = 0;
      for (let ky = -kernelHalf; ky <= kernelHalf; ky++) {
        for (let kx = -kernelHalf; kx <= kernelHalf; kx++) {
          const imageY = y + ky;
          const imageX = x + kx;
          if (imageY >= 0 && imageY < imageHeight && imageX >= 0 && imageX < imageWidth) {
            sum += image[imageY][imageX] * kernel[ky + kernelHalf][kx + kernelHalf];
          }
        }
      }
      result[y][x] = sum;
    }
  }
  return result;
}

function padImage(image: number[][], padding: number): number[][] {
  const imageHeight = image.length;
  const imageWidth = image[0].length;
  const paddedHeight = imageHeight + 2 * padding;
  const paddedWidth = imageWidth + 2 * padding;
  const paddedImage = Array(paddedHeight)
    .fill(null)
    .map(() => Array(paddedWidth).fill(0));

  for (let y = 0; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      paddedImage[y + padding][x + padding] = image[y][x];
    }
  }

  for (let y = padding; y < imageHeight + padding; y++) {
    for (let x = 0; x < padding; x++) {
      paddedImage[y][x] = image[y - padding][0];
      paddedImage[y][paddedWidth - 1 - x] = image[y - padding][imageWidth - 1];
    }
  }
  for (let x = 0; x < paddedWidth; x++) {
    for (let y = 0; y < padding; y++) {
      paddedImage[y][x] = paddedImage[padding][x];
      paddedImage[paddedHeight - 1 - y][x] = paddedImage[imageHeight + padding - 1][x];
    }
  }

  return paddedImage;
}

export function enhanceWithGabor(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  frequencies: number[],
  thetas: number[],
  kernelSize: number = 15,
  sigma: number = 4,
  gamma: number = 0.5,
  psi: number = 0,
) {
  const img: number[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(0));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      img[y][x] = data[(y * width + x) * 4] / 255.0;
    }
  }

  const imPad = padImage(img, Math.floor(kernelSize / 2));
  const accum: number[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(0));

  for (const theta of thetas) {
    for (const freq of frequencies) {
      const lambda = 1.0 / freq;
      const k = gaborKernel(kernelSize, sigma, theta, lambda, gamma, psi);
      let sumAbsK = 0;
      for (let i = 0; i < k.length; i++) {
        for (let j = 0; j < k[0].length; j++) {
          sumAbsK += Math.abs(k[i][j]);
        }
      }
      const normalizedK = k.map((row) => row.map((val) => val / sumAbsK));

      const resp = convolve2D(imPad, normalizedK);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          accum[y][x] = Math.max(accum[y][x], resp[y][x]);
        }
      }
    }
  }

  const resultData = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = Math.max(0, Math.min(1, accum[y][x])) * 255;
      const idx = (y * width + x) * 4;
      resultData[idx] = value;
      resultData[idx + 1] = value;
      resultData[idx + 2] = value;
      resultData[idx + 3] = 255;
    }
  }

  return resultData;
}
