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
