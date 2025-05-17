import { negation, rotate90counterclockwise } from "./manipulate";
import { erodeWithRep, padImage } from "./morphology";

const cropImage = (
  paddedData: Uint8ClampedArray,
  paddedWidth: number,
  paddedHeight: number,
  padding: number,
): Uint8ClampedArray => {
  const width = paddedWidth - 2 * padding;
  const height = paddedHeight - 2 * padding;
  const result = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const srcIdx = ((y + padding) * paddedWidth + (x + padding)) * 4;
      const dstIdx = (y * width + x) * 4;

      result[dstIdx] = paddedData[srcIdx];
      result[dstIdx + 1] = paddedData[srcIdx + 1];
      result[dstIdx + 2] = paddedData[srcIdx + 2];
      result[dstIdx + 3] = paddedData[srcIdx + 3];
    }
  }

  return result;
};

const hitAndMiss = (
  image: Uint8ClampedArray,
  width: number,
  height: number,
  seHit: number[][],
  repHit: number[][],
  seMiss: number[][],
  repMiss: number[][],
): Uint8ClampedArray => {
  // Convert image to binary representation (0 = object, 1 = background)
  const binaryImage = new Uint8ClampedArray(image.length);
  for (let i = 0; i < image.length; i += 4) {
    binaryImage[i] = binaryImage[i + 1] = binaryImage[i + 2] = image[i] < 128 ? 0 : 1;
    binaryImage[i + 3] = 255;
  }

  // Perform erosion on the object with hit structuring element
  const erosionObj = erodeWithRep(binaryImage, width, height, seHit, repHit);

  // Perform erosion on the background (negated image) with miss structuring element
  const negatedImage = negation(binaryImage);
  const erosionBg = erodeWithRep(negatedImage, width, height, seMiss, repMiss);

  // Logical AND of both erosions (since 0 is object in our convention)
  const result = new Uint8ClampedArray(image.length);
  for (let i = 0; i < result.length; i += 4) {
    const isObject = erosionObj[i] === 0 || erosionBg[i] === 0;
    result[i] = result[i + 1] = result[i + 2] = isObject ? 0 : 255;
    result[i + 3] = 255;
  }

  return result;
};

export const morphologicalThinning = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  numIterations: number = 10,
): Uint8ClampedArray => {
  const repPoint = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ];

  const seB1Hit = [
    [0, 0, 0],
    [0, 1, 0],
    [1, 1, 1],
  ];
  const seB7Hit = rotate90counterclockwise(seB1Hit);
  const seB5Hit = rotate90counterclockwise(seB7Hit);
  const seB3Hit = rotate90counterclockwise(seB5Hit);

  const seB1Miss = [
    [1, 1, 1],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const seB7Miss = rotate90counterclockwise(seB1Miss);
  const seB5Miss = rotate90counterclockwise(seB7Miss);
  const seB3Miss = rotate90counterclockwise(seB5Miss);

  const seB2Hit = [
    [0, 0, 0],
    [1, 1, 0],
    [1, 1, 0],
  ];
  const seB8Hit = rotate90counterclockwise(seB2Hit);
  const seB6Hit = rotate90counterclockwise(seB8Hit);
  const seB4Hit = rotate90counterclockwise(seB6Hit);

  const seB2Miss = [
    [0, 1, 1],
    [0, 0, 1],
    [0, 0, 0],
  ];
  const seB8Miss = rotate90counterclockwise(seB2Miss);
  const seB6Miss = rotate90counterclockwise(seB8Miss);
  const seB4Miss = rotate90counterclockwise(seB6Miss);

  const hitsArr = [seB1Hit, seB2Hit, seB3Hit, seB4Hit, seB5Hit, seB6Hit, seB7Hit, seB8Hit];
  const missesArr = [
    seB1Miss,
    seB2Miss,
    seB3Miss,
    seB4Miss,
    seB5Miss,
    seB6Miss,
    seB7Miss,
    seB8Miss,
  ];

  const pad = 1;
  const {
    data: paddedData,
    width: paddedWidth,
    height: paddedHeight,
  } = padImage(data, width, height, pad, 1);

  const resultImg = new Uint8ClampedArray(paddedData);

  for (let i = 0; i < numIterations; i++) {
    for (let j = 0; j < 8; j++) {
      const hmt = hitAndMiss(
        resultImg,
        paddedWidth,
        paddedHeight,
        hitsArr[j],
        repPoint,
        missesArr[j],
        repPoint,
      );

      const negatedHmt = negation(hmt);

      for (let k = 0; k < resultImg.length; k += 4) {
        resultImg[k] = resultImg[k] && negatedHmt[k];
        resultImg[k + 1] = resultImg[k + 1] && negatedHmt[k + 1];
        resultImg[k + 2] = resultImg[k + 2] && negatedHmt[k + 2];
        resultImg[k + 3] = 255;
      }
    }
  }

  return cropImage(resultImg, paddedWidth, paddedHeight, pad);
};
