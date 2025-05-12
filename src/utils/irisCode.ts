export type TDaugmanParams = {
  frequency: number;
  sigma: number;
  windowSize: number;
  normalizedWidth: number;
  normalizedHeight: number;
};

export const defaultDaugmanParams: TDaugmanParams = {
  frequency: 0.75,
  sigma: 5,
  windowSize: 25,
  normalizedWidth: 512,
  normalizedHeight: 128,
};

const daugmanNormalizeIris = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  pupilRadius: number,
  irisRadius: number,
  outputWidth: number = 512,
  outputHeight: number = 128,
): { normalizedImage: Uint8ClampedArray; visualizationImage: Uint8ClampedArray } => {
  const outputData = new Uint8ClampedArray(outputWidth * outputHeight * 4);
  const heightRelative = irisRadius - pupilRadius;

  const visualizationData = new Uint8ClampedArray(data);

  for (let i = 0; i < outputWidth; i++) {
    for (let j = 0; j < outputHeight / 2; j++) {
      const angle = Math.PI - Math.PI / 12 - ((11 / 12) * (2 * Math.PI * i)) / outputWidth;
      const radius = pupilRadius + (heightRelative * j) / outputHeight;

      const x = Math.round(centerX + radius * Math.cos(angle));
      const y = Math.round(centerY + radius * Math.sin(angle));

      if (x >= 0 && x < width && y >= 0 && y < height) {
        const vizIdx = (y * width + x) * 4;
        visualizationData[vizIdx] = 255;
        visualizationData[vizIdx + 1] = 50;
        visualizationData[vizIdx + 2] = 140;

        const dstIdx = (j * outputWidth + i) * 4;
        outputData[dstIdx] = data[vizIdx];
        outputData[dstIdx + 1] = data[vizIdx + 1];
        outputData[dstIdx + 2] = data[vizIdx + 2];
        outputData[dstIdx + 3] = 255;
      }
    }
  }

  for (let i = 0; i < outputWidth / 2; i++) {
    for (let j = outputHeight / 2; j < (3 * outputHeight) / 4; j++) {
      const angle1 =
        Math.PI - (67 / 360) * Math.PI - ((113 / 180) * (2 * Math.PI * i)) / outputWidth;
      const angle2 = angle1 + Math.PI;
      const radius = pupilRadius + (heightRelative * j) / outputHeight;

      const x1 = Math.round(centerX + radius * Math.cos(angle1));
      const y1 = Math.round(centerY + radius * Math.sin(angle1));
      const x2 = Math.round(centerX + radius * Math.cos(angle2));
      const y2 = Math.round(centerY + radius * Math.sin(angle2));

      if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height) {
        const vizIdx = (y1 * width + x1) * 4;
        visualizationData[vizIdx] = 255;
        visualizationData[vizIdx + 1] = 50;
        visualizationData[vizIdx + 2] = 140;

        const dstIdx = (j * outputWidth + i) * 4;
        outputData[dstIdx] = data[vizIdx];
        outputData[dstIdx + 1] = data[vizIdx + 1];
        outputData[dstIdx + 2] = data[vizIdx + 2];
        outputData[dstIdx + 3] = 255;
      }

      if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height) {
        const vizIdx = (y2 * width + x2) * 4;
        visualizationData[vizIdx] = 255;
        visualizationData[vizIdx + 1] = 50;
        visualizationData[vizIdx + 2] = 140;

        const dstIdx = (j * outputWidth + i + outputWidth / 2) * 4;
        outputData[dstIdx] = data[vizIdx];
        outputData[dstIdx + 1] = data[vizIdx + 1];
        outputData[dstIdx + 2] = data[vizIdx + 2];
        outputData[dstIdx + 3] = 255;
      }
    }
  }

  for (let i = 0; i < outputWidth / 2; i++) {
    for (let j = (3 * outputHeight) / 4; j < outputHeight; j++) {
      const angle1 = Math.PI - 0.25 * Math.PI - (Math.PI * i) / outputWidth;
      const angle2 = angle1 + Math.PI;
      const radius = pupilRadius + (heightRelative * j) / outputHeight;

      const x1 = Math.round(centerX + radius * Math.cos(angle1));
      const y1 = Math.round(centerY + radius * Math.sin(angle1));
      const x2 = Math.round(centerX + radius * Math.cos(angle2));
      const y2 = Math.round(centerY + radius * Math.sin(angle2));

      if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height) {
        const vizIdx = (y1 * width + x1) * 4;
        visualizationData[vizIdx] = 255;
        visualizationData[vizIdx + 1] = 50;
        visualizationData[vizIdx + 2] = 140;

        const dstIdx = (j * outputWidth + i) * 4;
        outputData[dstIdx] = data[vizIdx];
        outputData[dstIdx + 1] = data[vizIdx + 1];
        outputData[dstIdx + 2] = data[vizIdx + 2];
        outputData[dstIdx + 3] = 255;
      }

      if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height) {
        const vizIdx = (y2 * width + x2) * 4;
        visualizationData[vizIdx] = 255;
        visualizationData[vizIdx + 1] = 50;
        visualizationData[vizIdx + 2] = 140;

        const dstIdx = (j * outputWidth + i + outputWidth / 2) * 4;
        outputData[dstIdx] = data[vizIdx];
        outputData[dstIdx + 1] = data[vizIdx + 1];
        outputData[dstIdx + 2] = data[vizIdx + 2];
        outputData[dstIdx + 3] = 255;
      }
    }
  }

  return {
    normalizedImage: outputData,
    visualizationImage: visualizationData,
  };
};

const gaussianWeightedMean = (
  matrix: number[][],
  sigma: number = 5,
  window: number = 5,
): number[] => {
  const meanList: number[] = [];

  for (let i = 0; i < matrix[0].length - window + 1; i++) {
    const vector: number[][] = [];
    for (let row = 0; row < matrix.length; row++) {
      vector.push(matrix[row].slice(i, i + window));
    }

    const gauss = [];
    for (let x = 0; x < vector[0].length; x++) {
      const val = Math.exp((-0.5 * Math.pow(x - vector[0].length / 2, 2)) / Math.pow(sigma, 2));
      gauss.push(val);
    }

    const sum = gauss.reduce((a, b) => a + b, 0);
    const normalizedGauss = gauss.map((g) => g / sum);

    let weightedSum = 0;
    for (let row = 0; row < vector.length; row++) {
      for (let col = 0; col < vector[row].length; col++) {
        weightedSum += vector[row][col] * normalizedGauss[col];
      }
    }

    meanList.push(weightedSum / vector.length);
  }

  const finalList = [];
  for (let k = 0; k < 128; k++) {
    const indexOf = Math.floor((k * meanList.length) / 128);
    finalList.push(meanList[Math.min(indexOf, meanList.length - 1)]);
  }

  return finalList;
};

const gaborFunFactor = (
  vector: number[],
  xk: number,
  f: number,
): { real: number; imag: number } => {
  const sigma = 0.5 * Math.PI * f;
  let real = 0;
  let imag = 0;

  for (let x = 0; x < vector.length; x++) {
    const exp1 = Math.exp(-Math.pow(x - xk, 2) / Math.pow(sigma, 2));
    const angle = -2 * Math.PI * f * (x + 1);
    real += vector[x] * exp1 * Math.cos(angle);
    imag += vector[x] * exp1 * Math.sin(angle);
  }

  return { real, imag };
};

const complexToPart = (complex: { real: number; imag: number }): [number, number] => {
  const realPart = complex.real <= 0 ? 1 : 0;
  const imagPart = complex.imag < 0 ? 1 : 0;
  return [realPart, imagPart];
};

export const irisCodeToCrispImage = (
  irisCode: number[][],
  scale: number = 4,
): HTMLCanvasElement => {
  const width = irisCode[0].length;
  const height = irisCode.length;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const value = irisCode[y][x];

      ctx.fillStyle = value === 1 ? "#000000" : "#ffffff";
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }

  return canvas;
};

export const generateDaugmanIrisCode = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  pupilRadius: number,
  irisRadius: number,
  params: TDaugmanParams = defaultDaugmanParams,
): {
  irisCode: number[][];
  normalizedImage: Uint8ClampedArray;
  visualizationImage: Uint8ClampedArray;
} => {
  const { normalizedImage, visualizationImage } = daugmanNormalizeIris(
    data,
    width,
    height,
    centerX,
    centerY,
    pupilRadius,
    irisRadius,
    params.normalizedWidth,
    params.normalizedHeight,
  );

  const irisCode: number[][] = Array(16)
    .fill(0)
    .map(() => Array(128).fill(0));

  for (let segment = 0; segment < 8; segment++) {
    const rowStart = segment * Math.floor(params.normalizedHeight / 8);
    const rowEnd = (segment + 1) * Math.floor(params.normalizedHeight / 8);

    const segmentData: number[][] = [];
    for (let y = rowStart; y < rowEnd; y++) {
      const row: number[] = [];
      for (let x = 0; x < params.normalizedWidth; x++) {
        const idx = (y * params.normalizedWidth + x) * 4;
        row.push(normalizedImage[idx]);
      }
      segmentData.push(row);
    }

    const gaussianVector = gaussianWeightedMean(segmentData, params.sigma, params.windowSize);

    for (let k = 0; k < 128; k++) {
      const complex = gaborFunFactor(gaussianVector, k, params.frequency);
      const [realPart, imagPart] = complexToPart(complex);

      irisCode[2 * segment][k] = realPart;
      irisCode[2 * segment + 1][k] = imagPart;
    }
  }

  return {
    irisCode,
    normalizedImage,
    visualizationImage,
  };
};

export const createIrisComparisonReport = (
  code1: number[][],
  code2: number[][],
  threshold: number = 0.2,
): {
  match: boolean;
  distance: number;
  shift: number;
  visualization1: HTMLCanvasElement;
  visualization2: HTMLCanvasElement;
  comparisonVisualization: HTMLCanvasElement;
} => {
  if (code1.length !== code2.length || code1[0].length !== code2[0].length) {
    throw new Error("Kody tęczówek muszą mieć te same wymiary");
  }
  let minDistance = 1.0;
  let optimalShift = 0;

  for (let shift = -8; shift <= 8; shift++) {
    let differences = 0;
    const totalBits = code1.length * code1[0].length;

    for (let i = 0; i < code1.length; i++) {
      for (let j = 0; j < code1[0].length; j++) {
        const shiftedJ = (j + shift + code1[0].length) % code1[0].length;

        if (code1[i][j] !== code2[i][shiftedJ]) {
          differences++;
        }
      }
    }

    const distance = differences / totalBits;
    if (distance < minDistance) {
      minDistance = distance;
      optimalShift = shift;
    }
  }

  const visualization1 = irisCodeToCrispImage(code1);
  const visualization2 = irisCodeToCrispImage(code2);

  const comparisonVisualization = document.createElement("canvas");
  comparisonVisualization.width = visualization1.width;
  comparisonVisualization.height = visualization1.height;

  const ctx = comparisonVisualization.getContext("2d");
  if (ctx) {
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < code1.length; y++) {
      for (let x = 0; x < code1[0].length; x++) {
        const shiftedX = (x + optimalShift + code1[0].length) % code1[0].length;

        if (code1[y][x] !== code2[y][shiftedX]) {
          ctx.fillStyle = "#ff0000";
        } else {
          ctx.fillStyle = code1[y][x] === 1 ? "#000000" : "#ffffff";
        }

        ctx.fillRect(x * 4, y * 4, 4, 4);
      }
    }
  }

  return {
    match: minDistance < threshold,
    distance: minDistance,
    shift: optimalShift,
    visualization1,
    visualization2,
    comparisonVisualization,
  };
};
