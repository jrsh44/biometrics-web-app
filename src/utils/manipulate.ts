export const applyGrayscale = (r: number, g: number, b: number): [number, number, number] => {
  const avg = (r + g + b) / 3;
  return [avg, avg, avg];
};

export const applyBrightness = (
  r: number,
  g: number,
  b: number,
  brightness: number,
): [number, number, number] => [
  r * (brightness / 100),
  g * (brightness / 100),
  b * (brightness / 100),
];

export const applyContrast = (
  r: number,
  g: number,
  b: number,
  contrast: number,
): [number, number, number] => [
  (r - 128) * (contrast / 100) + 128,
  (g - 128) * (contrast / 100) + 128,
  (b - 128) * (contrast / 100) + 128,
];

export const applyNegative = (r: number, g: number, b: number): [number, number, number] => [
  255 - r,
  255 - g,
  255 - b,
];

export const applyBinarization = (
  r: number,
  g: number,
  b: number,
  threshold: number,
): [number, number, number] => ((r + g + b) / 3 < threshold ? [0, 0, 0] : [255, 255, 255]);

export const binarizeClampedArray = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number = 128,
) => {
  const result = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const avgValue = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

      const binaryValue = avgValue > threshold ? 255 : 0;

      result[idx] = result[idx + 1] = result[idx + 2] = binaryValue;

      result[idx + 3] = data[idx + 3];
    }
  }

  return result;
};

export const normalizeClampedArray = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  eps: number = 1e-8,
) => {
  const result = new Float32Array(data.length);
  let sum = 0;
  let sumSq = 0;

  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    sum += gray;
    sumSq += gray * gray;
  }

  const totalPixels = width * height;
  const mean = sum / totalPixels;
  const variance = sumSq / totalPixels - mean * mean;
  const stdDev = Math.sqrt(variance);

  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const normalized = (gray - mean) / (stdDev + eps);

    result[i] = result[i + 1] = result[i + 2] = normalized;
    result[i + 3] = data[i + 3];
  }

  return result;
};

export const contrastStretch = (data: Float32Array) => {
  const result = new Uint8ClampedArray(data.length);
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i];
    if (gray < min) min = gray;
    if (gray > max) max = gray;
  }

  for (let i = 0; i < data.length; i += 4) {
    const stretched = ((data[i] - min) / (max - min)) * 255;

    result[i] = result[i + 1] = result[i + 2] = Math.min(255, Math.max(0, stretched));
    result[i + 3] = data[i + 3];
  }

  return result;
};

export const negateClampedArray = (data: Uint8ClampedArray) => {
  const result = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    result[i] = 255 - data[i];
    result[i + 1] = 255 - data[i + 1];
    result[i + 2] = 255 - data[i + 2];
    result[i + 3] = data[i + 3];
  }

  return result;
};
