import { binarizeClampedArray } from "./manipulate";
import { close, defaultSquareKernel, dilate, EMorphology, erode, open } from "./morphology";

export const distanceTransform = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
): Uint8ClampedArray => {
  const binaryMatrix = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      binaryMatrix[y * width + x] =
        data[i] > 128 || data[i + 1] > 128 || data[i + 2] > 128 ? 255 : 0;
    }
  }

  const distanceMap = new Uint32Array(width * height);
  const INF = width + height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      distanceMap[idx] = binaryMatrix[idx] === 255 ? 0 : INF;
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;

      if (distanceMap[idx] === 0) continue;

      let minDist = INF;

      if (y > 0 && x > 0) minDist = Math.min(minDist, distanceMap[(y - 1) * width + (x - 1)] + 1);
      if (y > 0) minDist = Math.min(minDist, distanceMap[(y - 1) * width + x] + 1);
      if (y > 0 && x < width - 1)
        minDist = Math.min(minDist, distanceMap[(y - 1) * width + (x + 1)] + 1);
      if (x > 0) minDist = Math.min(minDist, distanceMap[y * width + (x - 1)] + 1);

      distanceMap[idx] = minDist;
    }
  }

  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const idx = y * width + x;

      if (x < width - 1)
        distanceMap[idx] = Math.min(distanceMap[idx], distanceMap[y * width + (x + 1)] + 1);
      if (y < height - 1 && x > 0)
        distanceMap[idx] = Math.min(distanceMap[idx], distanceMap[(y + 1) * width + (x - 1)] + 1);
      if (y < height - 1)
        distanceMap[idx] = Math.min(distanceMap[idx], distanceMap[(y + 1) * width + x] + 1);
      if (y < height - 1 && x < width - 1)
        distanceMap[idx] = Math.min(distanceMap[idx], distanceMap[(y + 1) * width + (x + 1)] + 1);
    }
  }

  let maxDist = 0;
  for (let i = 0; i < distanceMap.length; i++) {
    if (distanceMap[i] !== INF && distanceMap[i] > maxDist) {
      maxDist = distanceMap[i];
    }
  }

  const result = new Uint8ClampedArray(data.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dist = distanceMap[y * width + x];
      const normalizedValue = dist === INF ? 0 : 255 - (dist / maxDist) * 255;
      const i = (y * width + x) * 4;
      result[i] = normalizedValue;
      result[i + 1] = normalizedValue;
      result[i + 2] = normalizedValue;
      result[i + 3] = data[i + 3];
    }
  }

  return result;
};

export const calculateP = (data: Uint8ClampedArray, width: number, height: number): number => {
  let P = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      P += data[(y * width + x) * 4];
    }
  }

  return P / (width * height);
};

export const getPupil = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  Xl: number = 4.5,
  threshold: number = 216,
  operations: EMorphology[] = [],
  kernel: number[][] = defaultSquareKernel,
): Uint8ClampedArray<ArrayBufferLike> => {
  const P = calculateP(data, width, height);

  let processed = binarizeClampedArray(data, width, height, P / Xl);
  processed = distanceTransform(processed, width, height);
  processed = binarizeClampedArray(processed, width, height, threshold);

  for (const operation of operations) {
    switch (operation) {
      case EMorphology.Erode:
        processed = erode(processed, width, height, kernel);
        break;
      case EMorphology.Dilate:
        processed = dilate(processed, width, height, kernel);
        break;
      case EMorphology.Open:
        processed = open(processed, width, height, kernel);
        break;
      case EMorphology.Close:
        processed = close(processed, width, height, kernel);
        break;
    }
  }

  return processed;
};

export const detectPupilWithProjections = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
): { centerX: number; centerY: number; radius: number } | null => {
  const horizontalProj = new Array(height).fill(0);
  const verticalProj = new Array(width).fill(0);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const isBlack = data[idx] < 128;

      if (isBlack) {
        horizontalProj[y]++;
        verticalProj[x]++;
      }
    }
  }

  const maxThreshold = Math.min(width, height) * 0.8;

  for (let i = 0; i < horizontalProj.length; i++) {
    if (horizontalProj[i] > maxThreshold) {
      horizontalProj[i] = 0;
    }
  }

  for (let i = 0; i < verticalProj.length; i++) {
    if (verticalProj[i] > maxThreshold) {
      verticalProj[i] = 0;
    }
  }

  const smoothedHorizontal = applyMovingAverage(horizontalProj, 3);
  const smoothedVertical = applyMovingAverage(verticalProj, 3);

  const hRegions = findDensityRegions(smoothedHorizontal, 10);
  const vRegions = findDensityRegions(smoothedVertical, 10);

  if (!hRegions.length || !vRegions.length) {
    console.log("Nie wykryto żadnych potencjalnych obszarów źrenicy");
    return null;
  }

  const bestHRegion = findBestRegion(hRegions);
  const bestVRegion = findBestRegion(vRegions);

  if (!bestHRegion || !bestVRegion) {
    console.log("Nie można wybrać najlepszego regionu");
    return null;
  }

  const centerY = Math.round(bestHRegion.start + (bestHRegion.end - bestHRegion.start) / 2);
  const centerX = Math.round(bestVRegion.start + (bestVRegion.end - bestVRegion.start) / 2);

  const height_radius = (bestHRegion.end - bestHRegion.start) / 2;
  const width_radius = (bestVRegion.end - bestVRegion.start) / 2;
  const radius = Math.round((height_radius + width_radius) / 2);

  const aspectRatio = Math.max(height_radius, width_radius) / Math.min(height_radius, width_radius);
  if (aspectRatio > 2.0) {
    console.log("Wykryty obszar nie przypomina okręgu (zbyt wydłużony)");
    return null;
  }

  const borderMargin = radius * 0.5;
  if (
    centerX < borderMargin ||
    centerY < borderMargin ||
    centerX > width - borderMargin ||
    centerY > height - borderMargin
  ) {
    console.log("Źrenica zbyt blisko krawędzi obrazu");
    return null;
  }

  return { centerX, centerY, radius };
};

const applyMovingAverage = (data: number[], windowSize: number): number[] => {
  const result = new Array(data.length).fill(0);
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < data.length; i++) {
    let sum = 0;
    let count = 0;

    for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
      sum += data[j];
      count++;
    }

    result[i] = sum / count;
  }

  return result;
};

const findDensityRegions = (
  projection: number[],
  minThreshold: number,
): Array<{ start: number; end: number; sum: number }> => {
  const regions = [];
  let inRegion = false;
  let start = 0;
  let sum = 0;

  for (let i = 0; i < projection.length; i++) {
    if (projection[i] > minThreshold) {
      if (!inRegion) {
        inRegion = true;
        start = i;
        sum = 0;
      }
      sum += projection[i];
    } else if (inRegion) {
      regions.push({ start, end: i - 1, sum });
      inRegion = false;
    }
  }

  if (inRegion) {
    regions.push({ start, end: projection.length - 1, sum });
  }

  return regions;
};

const findBestRegion = (
  regions: Array<{ start: number; end: number; sum: number }>,
): { start: number; end: number; sum: number } | null => {
  if (regions.length === 0) return null;

  const filteredRegions = regions.filter((r) => r.end - r.start >= 5);

  if (filteredRegions.length === 0) return regions[0];

  const qualityScores = filteredRegions.map((region) => {
    const size = region.end - region.start;
    const avgValue = region.sum / size;
    return avgValue * Math.min(size, 50);
  });

  let bestIndex = 0;
  let bestScore = qualityScores[0];

  for (let i = 1; i < qualityScores.length; i++) {
    if (qualityScores[i] > bestScore) {
      bestScore = qualityScores[i];
      bestIndex = i;
    }
  }

  return filteredRegions[bestIndex];
};
