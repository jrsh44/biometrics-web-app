const getMeanPixelValueInCircle = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  centerX: number,
  centerY: number,
  rOut: number,
  rIn: number = 0,
): number | null => {
  let sum = 0;
  let count = 0;

  const x = Math.round(centerX);
  const y = Math.round(centerY);

  const rOutSquared = rOut * rOut;
  const rInSquared = rIn * rIn;

  for (let j = Math.max(0, y - rOut); j <= Math.min(height - 1, y + rOut); j++) {
    for (let i = Math.max(0, x - rOut); i <= Math.min(width - 1, x + rOut); i++) {
      const distSquared = (i - x) ** 2 + (j - y) ** 2;

      if (distSquared <= rOutSquared && distSquared >= rInSquared) {
        const idx = (j * width + i) * 4;
        sum += data[idx];
        count++;
      }
    }
  }

  return count !== 0 ? sum / count : null;
};

export const listOfMeanPixelValuesInEyeStartingFromPupil = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  pupilCenterX: number,
  pupilCenterY: number,
  eyeRadius: number,
  useRings: boolean = true,
  step: number = 1,
): number[] => {
  const meanPixelValues: number[] = [];

  if (useRings) {
    for (let i = 1; i < eyeRadius; i += step) {
      const meanPixelVal = getMeanPixelValueInCircle(
        data,
        width,
        height,
        pupilCenterX,
        pupilCenterY,
        i,
        i - 1,
      );

      if (meanPixelVal === null) {
        if (meanPixelValues.length === 0) {
          meanPixelValues.push(0);
        } else {
          meanPixelValues.push(meanPixelValues[meanPixelValues.length - 1]);
        }
      } else {
        meanPixelValues.push(meanPixelVal);
      }
    }
  } else {
    for (let i = 0; i < eyeRadius; i += step) {
      const meanPixelVal = getMeanPixelValueInCircle(
        data,
        width,
        height,
        pupilCenterX,
        pupilCenterY,
        i,
      );

      if (meanPixelVal === null) {
        if (meanPixelValues.length === 0) {
          meanPixelValues.push(0);
        } else {
          meanPixelValues.push(meanPixelValues[meanPixelValues.length - 1]);
        }
      } else {
        meanPixelValues.push(meanPixelVal);
      }
    }
  }

  return meanPixelValues;
};

export const findLargestJumps = (
  data: number[],
  pupilRadius: number,
  thresholdRadius: number = pupilRadius * 1.3,
): { pupilJump: number | null; irisJump: number | null } => {
  if (data.length < 2) return { pupilJump: null, irisJump: null };

  const differences: { index: number; value: number; radius: number }[] = [];
  for (let i = 1; i < data.length; i++) {
    differences.push({
      index: i,
      value: Math.abs(data[i] - data[i - 1]),
      radius: pupilRadius + i,
    });
  }

  const pupilJumps = [...differences].sort((a, b) => b.value - a.value).slice(0, 2);
  const pupilJump = pupilJumps[0]?.index || null;

  const irisJumpCandidates = differences
    .filter((d) => d.radius > thresholdRadius)
    .sort((a, b) => b.value - a.value);

  const irisJump = irisJumpCandidates.length > 0 ? irisJumpCandidates[0].index : null;

  return { pupilJump, irisJump };
};
