export const applyGrayscale = (r: number, g: number, b: number): [number, number, number] => {
  const avg = (r + g + b) / 3;
  return [avg, avg, avg];
};

export const applyBrightness = (
  r: number,
  g: number,
  b: number,
  brightness: number,
): [number, number, number] => {
  return [r * (brightness / 100), g * (brightness / 100), b * (brightness / 100)];
};

export const applyContrast = (
  r: number,
  g: number,
  b: number,
  contrast: number,
): [number, number, number] => {
  return [
    (r - 128) * (contrast / 100) + 128,
    (g - 128) * (contrast / 100) + 128,
    (b - 128) * (contrast / 100) + 128,
  ];
};

export const applyNegative = (r: number, g: number, b: number): [number, number, number] => {
  return [255 - r, 255 - g, 255 - b];
};

export const applyBinarization = (
  r: number,
  g: number,
  b: number,
  threshold: number,
): [number, number, number] => {
  const avg = (r + g + b) / 3;
  return avg < threshold ? [0, 0, 0] : [255, 255, 255];
};
