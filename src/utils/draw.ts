export const drawCrosshair = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  size: number,
  color: [number, number, number, number] = [255, 0, 0, 255],
): Uint8ClampedArray<ArrayBuffer> => {
  const result = new Uint8ClampedArray(data);

  for (let x = centerX - size; x <= centerX + size; x++) {
    if (x >= 0 && x < width) {
      const idx = (centerY * width + x) * 4;
      result[idx] = color[0];
      result[idx + 1] = color[1];
      result[idx + 2] = color[2];
      result[idx + 3] = color[3];
    }
  }

  for (let y = centerY - size; y <= centerY + size; y++) {
    if (y >= 0 && y < height) {
      const idx = (y * width + centerX) * 4;
      result[idx] = color[0];
      result[idx + 1] = color[1];
      result[idx + 2] = color[2];
      result[idx + 3] = color[3];
    }
  }

  return result;
};

export const drawCircle = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  radius: number,
  color: [number, number, number, number] = [0, 255, 0, 255],
  thickness: number = 1,
): Uint8ClampedArray<ArrayBuffer> => {
  const result = new Uint8ClampedArray(data);

  for (let angle = 0; angle < 360; angle++) {
    const radians = (angle * Math.PI) / 180;

    for (let t = 0; t < thickness; t++) {
      const drawRadius = radius - t;
      const px = Math.round(centerX + drawRadius * Math.cos(radians));
      const py = Math.round(centerY + drawRadius * Math.sin(radians));

      if (px >= 0 && px < width && py >= 0 && py < height) {
        const idx = (py * width + px) * 4;
        result[idx] = color[0];
        result[idx + 1] = color[1];
        result[idx + 2] = color[2];
        result[idx + 3] = color[3];
      }
    }
  }

  return result;
};
