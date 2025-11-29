import * as math from 'mathjs';

/**
 * Generates synthetic data for linear regression.
 *
 * @param {number} n - The number of samples.
 * @param {number} p - The number of predictors (features).
 * @param {number} noiseLevel - The standard deviation of the noise.
 * @returns {{X: number[][], y: number[], trueBeta: number[]}} - The generated data.
 */
export function generateLinearRegressionData(n, p, noiseLevel) {
  const trueBeta = Array.from({ length: p }, () => Math.random() * 2 - 1); // Coefficients between -1 and 1
  const X = [];
  const y = [];

  for (let i = 0; i < n; i++) {
    const x_i = Array.from({ length: p }, () => Math.random() * 10); // Features between 0 and 10
    let y_i = x_i.reduce((acc, val, j) => acc + val * trueBeta[j], 0);
    y_i += (Math.random() - 0.5) * 2 * noiseLevel; // Add noise
    X.push(x_i);
    y.push(y_i);
  }

  return { X, y, trueBeta };
}

