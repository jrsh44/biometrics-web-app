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
): Uint8ClampedArray => {
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

export const negation = (data: Uint8ClampedArray): Uint8ClampedArray => {
  const result = new Uint8ClampedArray(data.length);

  for (let i = 0; i < data.length; i += 4) {
    const pixelValue = data[i] > 0 ? 0 : 255;
    result[i] = result[i + 1] = result[i + 2] = pixelValue;
    result[i + 3] = data[i + 3];
  }

  return result;
};

export const rotate90counterclockwise = (matrix: number[][]): number[][] => {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated = Array(cols)
    .fill(0)
    .map(() => Array(rows).fill(0));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      rotated[cols - j - 1][i] = matrix[i][j];
    }
  }

  return rotated;
};
