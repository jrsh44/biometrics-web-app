export const defaultAverageKernel = [
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
];

export const defaultGaussianKernel = [
  [1, 2, 1],
  [2, 4, 2],
  [1, 2, 1],
];

export const defaultSharpenKernel = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0],
];

export const defaultRobertsCrossKernelX = [
  [1, 0],
  [0, -1],
];

export const defaultRobertsCrossKernelY = [
  [0, 1],
  [-1, 0],
];

export const defaultSobelKernelX = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

export const defaultSobelKernelY = [
  [1, 2, 1],
  [0, 0, 0],
  [-1, -2, -1],
];
