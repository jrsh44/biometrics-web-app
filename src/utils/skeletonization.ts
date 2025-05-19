const toBinaryImage = (data: Uint8ClampedArray, width: number, height: number): number[][] => {
  const binaryImage: number[][] = [];
  for (let i = 0; i < height; i++) {
    const row: number[] = [];
    for (let j = 0; j < width; j++) {
      const idx = (i * width + j) * 4;
      const value = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      row.push(value < 128 ? 0 : 255);
    }
    binaryImage.push(row);
  }
  return binaryImage;
};

const fromBinaryImage = (
  binaryImage: number[][],
  width: number,
  height: number,
): Uint8ClampedArray => {
  const data = new Uint8ClampedArray(4 * width * height);
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const idx = (i * width + j) * 4;
      data[idx] = data[idx + 1] = data[idx + 2] = binaryImage[i][j];
      data[idx + 3] = 255;
    }
  }
  return data;
};

const negate = (image: number[][]): number[][] => {
  return image.map((row) => row.map((pixel) => (pixel === 0 ? 255 : 0)));
};

const padImage = (image: number[][], pad: number, value: number): number[][] => {
  const padded: number[][] = [];
  const width = image[0].length;
  const height = image.length;

  for (let i = 0; i < height + 2 * pad; i++) {
    const row: number[] = [];
    for (let j = 0; j < width + 2 * pad; j++) {
      if (i < pad || i >= height + pad || j < pad || j >= width + pad) {
        row.push(value);
      } else {
        row.push(image[i - pad][j - pad]);
      }
    }
    padded.push(row);
  }
  return padded;
};

const erosionRep = (image: number[][], se: number[][], repPt: number[][]): number[][] => {
  const [repI, repJ] = repPt
    .flatMap((row, i) => row.map((value, j) => (value === 0 ? [i, j] : null)))
    .find((point) => point !== null) || [0, 0]; // Znajdź współrzędne punktu reprezentatywnego

  const seHeight = se.length;
  const seWidth = se[0].length;
  const pad = Math.max(repI, repJ, seHeight - 1 - repI, seWidth - 1 - repJ);

  const padded = padImage(image, pad, 255);

  const height = image.length;
  const width = image[0].length;
  const result: number[][] = Array.from({ length: height }, () => Array(width).fill(0));

  const count = se.flat().filter((value) => value === 0).length;

  for (let i = 0; i < seHeight; i++) {
    for (let j = 0; j < seWidth; j++) {
      if (se[i][j] === 0) {
        const di = i - repI;
        const dj = j - repJ;

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            if (padded[y + pad + di][x + pad + dj] === 0) {
              result[y][x]++;
            }
          }
        }
      }
    }
  }

  return result.map((row) => row.map((pixel) => (pixel === count ? 0 : 255)));
};

const hitAndMiss = (
  image: number[][],
  seHit: number[][],
  repHit: number[][],
  seMiss: number[][],
  repMiss: number[][],
): number[][] => {
  const erosionObj = erosionRep(image, seHit, repHit);
  const erosionBg = erosionRep(negate(image), seMiss, repMiss);

  return erosionObj.map((row, i) =>
    row.map((pixel, j) => (pixel === 0 && erosionBg[i][j] === 0 ? 0 : 255)),
  );
};

export const morphologicalThinning = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  numIter: number,
) => {
  const binaryImage = toBinaryImage(data, width, height);

  const repPoint = [
    [255, 255, 255],
    [255, 0, 255],
    [255, 255, 255],
  ];

  const hits = [
    [
      [255, 255, 255],
      [255, 0, 255],
      [0, 0, 0],
    ],
    [
      [255, 255, 255],
      [0, 0, 255],
      [0, 0, 255],
    ],
    [
      [0, 255, 255],
      [0, 0, 255],
      [0, 255, 255],
    ],
    [
      [0, 0, 255],
      [0, 0, 255],
      [255, 255, 255],
    ],
    [
      [0, 0, 0],
      [255, 0, 255],
      [255, 255, 255],
    ],
    [
      [255, 0, 0],
      [255, 0, 0],
      [255, 255, 255],
    ],
    [
      [255, 255, 0],
      [255, 0, 0],
      [255, 255, 0],
    ],
    [
      [255, 255, 255],
      [255, 0, 0],
      [255, 0, 0],
    ],
  ];

  const misses = [
    [
      [0, 0, 0],
      [255, 255, 255],
      [255, 255, 255],
    ],
    [
      [255, 0, 0],
      [255, 255, 0],
      [255, 255, 255],
    ],
    [
      [255, 255, 0],
      [255, 255, 0],
      [255, 255, 0],
    ],
    [
      [255, 255, 255],
      [255, 255, 0],
      [255, 0, 0],
    ],
    [
      [255, 255, 255],
      [255, 255, 255],
      [0, 0, 0],
    ],
    [
      [255, 255, 255],
      [0, 255, 255],
      [0, 0, 255],
    ],
    [
      [0, 255, 255],
      [0, 255, 255],
      [0, 255, 255],
    ],
    [
      [0, 0, 255],
      [0, 255, 255],
      [255, 255, 255],
    ],
  ];

  let result = binaryImage;

  for (let iter = 0; iter < numIter; iter++) {
    for (let i = 0; i < hits.length; i++) {
      const hmt = hitAndMiss(result, hits[i], repPoint, misses[i], repPoint);
      result = result.map((row, y) => row.map((pixel, x) => (hmt[y][x] === 0 ? 255 : pixel)));
    }
  }

  return fromBinaryImage(result, width, height);
};

const ravelAndRemoveCenter = (matrix: number[][]): boolean[] => {
  // Przekształcenie matrycy 3x3 w tablicę, pomijając środkowy element
  // Kolejność: góra, góra-prawo, prawo, prawo-dół, dół, dół-lewo, lewo, lewo-góra (zgodnie z ruchem wskazówek zegara)
  return [
    matrix[0][1] !== 0,
    matrix[0][2] !== 0,
    matrix[1][2] !== 0,
    matrix[2][2] !== 0,
    matrix[2][1] !== 0,
    matrix[2][0] !== 0,
    matrix[1][0] !== 0,
    matrix[0][0] !== 0,
  ];
};

const getWeights = (): number[] => {
  return [1, 2, 4, 8, 16, 32, 64, 128];
};

const calculateNeighborhoodValue = (neighborhood: boolean[]): number => {
  const weights = getWeights();
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    if (neighborhood[i]) {
      sum += weights[i];
    }
  }
  return sum;
};

const isTwo = (matrix: number[][]): boolean => {
  if (matrix[1][1] === 0) return false; // Rozpatrujemy tylko piksele o wartości 1

  const nbh = ravelAndRemoveCenter(matrix);
  const sum = nbh.filter(Boolean).length;
  return sum !== 8; // Jeśli któryś z sąsiadów jest pusty, zwracamy true
};

const isThree = (matrix: number[][]): boolean => {
  if (matrix[1][1] !== 2) return false; // Rozpatrujemy tylko piksele o wartości 2

  const nbh = ravelAndRemoveCenter(matrix);
  // Sprawdzamy czy piksele góra, prawo, dół, lewo są zapełnione
  return nbh[0] && nbh[2] && nbh[4] && nbh[6];
};

const isFour = (matrix: number[][]): boolean => {
  if (matrix[1][1] === 0) return false; // Rozpatrujemy tylko niezerowe piksele

  const fourList = [
    3, 6, 12, 24, 48, 96, 192, 129, 7, 14, 28, 56, 112, 224, 193, 131, 15, 30, 60, 120, 240, 225,
    195, 135,
  ];

  const nbh = ravelAndRemoveCenter(matrix);
  const value = calculateNeighborhoodValue(nbh);

  return fourList.includes(value);
};

const isToDelete2 = (matrix: number[][]): boolean => {
  if (matrix[1][1] !== 2) return false; // Rozpatrujemy tylko piksele o wartości 2

  const toDeleteList = [
    3, 5, 7, 12, 13, 14, 15, 20, 21, 22, 23, 28, 29, 30, 31, 48, 52, 53, 54, 55, 56, 60, 61, 62, 63,
    65, 67, 69, 71, 77, 79, 80, 81, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 97, 99, 101,
    103, 109, 111, 112, 113, 115, 116, 117, 118, 119, 120, 121, 123, 124, 125, 126, 127, 131, 133,
    135, 141, 143, 149, 151, 157, 159, 181, 183, 189, 191, 192, 193, 195, 197, 199, 205, 207, 208,
    209, 211, 212, 213, 214, 215, 216, 217, 219, 220, 221, 222, 223, 224, 225, 227, 229, 231, 237,
    239, 240, 241, 243, 244, 245, 246, 247, 248, 249, 251, 252, 253, 254, 255,
  ];

  const nbh = ravelAndRemoveCenter(matrix);
  const value = calculateNeighborhoodValue(nbh);

  return toDeleteList.includes(value);
};

const isToDelete3 = (matrix: number[][]): boolean => {
  if (matrix[1][1] !== 3) return false; // Rozpatrujemy tylko piksele o wartości 3

  // Ta sama lista jak w isToDelete2
  const toDeleteList = [
    3, 5, 7, 12, 13, 14, 15, 20, 21, 22, 23, 28, 29, 30, 31, 48, 52, 53, 54, 55, 56, 60, 61, 62, 63,
    65, 67, 69, 71, 77, 79, 80, 81, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 97, 99, 101,
    103, 109, 111, 112, 113, 115, 116, 117, 118, 119, 120, 121, 123, 124, 125, 126, 127, 131, 133,
    135, 141, 143, 149, 151, 157, 159, 181, 183, 189, 191, 192, 193, 195, 197, 199, 205, 207, 208,
    209, 211, 212, 213, 214, 215, 216, 217, 219, 220, 221, 222, 223, 224, 225, 227, 229, 231, 237,
    239, 240, 241, 243, 244, 245, 246, 247, 248, 249, 251, 252, 253, 254, 255,
  ];

  const nbh = ravelAndRemoveCenter(matrix);
  const value = calculateNeighborhoodValue(nbh);

  return toDeleteList.includes(value);
};

const applyPatchRule = (
  img: number[][],
  rule: (matrix: number[][]) => boolean,
  valueToSet: number,
): number[][] => {
  const height = img.length;
  const width = img[0].length;
  const result = img.map((row) => [...row]);

  for (let i = 1; i < height - 1; i++) {
    for (let j = 1; j < width - 1; j++) {
      const patch = [
        [img[i - 1][j - 1], img[i - 1][j], img[i - 1][j + 1]],
        [img[i][j - 1], img[i][j], img[i][j + 1]],
        [img[i + 1][j - 1], img[i + 1][j], img[i + 1][j + 1]],
      ];

      if (rule(patch)) {
        result[i][j] = valueToSet;
      }
    }
  }

  return result;
};

const applyDeletePatchRule = (img: number[][], rule: (matrix: number[][]) => boolean): void => {
  const height = img.length;
  const width = img[0].length;

  for (let i = 1; i < height - 1; i++) {
    for (let j = 1; j < width - 1; j++) {
      const patch = [
        [img[i - 1][j - 1], img[i - 1][j], img[i - 1][j + 1]],
        [img[i][j - 1], img[i][j], img[i][j + 1]],
        [img[i + 1][j - 1], img[i + 1][j], img[i + 1][j + 1]],
      ];

      if (rule(patch)) {
        img[i][j] = 0;
      }
    }
  }
};

const padImage2D = (image: number[][], padSize: number, value: number): number[][] => {
  const height = image.length;
  const width = image[0].length;
  const paddedHeight = height + 2 * padSize;
  const paddedWidth = width + 2 * padSize;

  const paddedImage: number[][] = Array(paddedHeight)
    .fill(null)
    .map(() => Array(paddedWidth).fill(value));

  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      paddedImage[i + padSize][j + padSize] = image[i][j];
    }
  }

  return paddedImage;
};

export const kmmThinning = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  numIter: number = 10,
) => {
  const binaryImage = toBinaryImage(data, width, height);

  let bitmap = negate(binaryImage);

  bitmap = padImage2D(bitmap, 1, 0);

  for (let iter = 0; iter < numIter; iter++) {
    bitmap = applyPatchRule(bitmap, isTwo, 2);

    bitmap = applyPatchRule(bitmap, isThree, 3);

    bitmap = applyPatchRule(bitmap, isFour, 4);

    for (let i = 0; i < bitmap.length; i++) {
      for (let j = 0; j < bitmap[0].length; j++) {
        if (bitmap[i][j] === 4) {
          bitmap[i][j] = 0;
        }
      }
    }

    applyDeletePatchRule(bitmap, isToDelete2);
    applyDeletePatchRule(bitmap, isToDelete3);

    for (let i = 0; i < bitmap.length; i++) {
      for (let j = 0; j < bitmap[0].length; j++) {
        if (bitmap[i][j] !== 0) {
          bitmap[i][j] = 1;
        }
      }
    }
  }

  const result: number[][] = [];
  for (let i = 1; i < bitmap.length - 1; i++) {
    const row: number[] = [];
    for (let j = 1; j < bitmap[0].length - 1; j++) {
      row.push(bitmap[i][j] === 0 ? 0 : 255);
    }
    result.push(row);
  }

  return fromBinaryImage(negate(result), width, height);
};
