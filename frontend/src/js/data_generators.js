import math from "./math_config.js";
import { choleskyDecomposition } from './math_linear_algebra.js';

/**
 * Generates synthetic data for linear regression.
 */
export function generateLinearRegressionData(n, p, noiseLevel) {
  const trueBeta = Array.from({ length: p }, () => Math.random() * 2 - 1);
  const X = [];
  const y = [];

  for (let i = 0; i < n; i++) {
    const x_i = Array.from({ length: p }, () => Math.random() * 10);
    let y_i = x_i.reduce((acc, val, j) => acc + val * trueBeta[j], 0);
    y_i += (Math.random() - 0.5) * 2 * noiseLevel;
    X.push(x_i);
    y.push(y_i);
  }

  return { X, y, trueBeta };
}

/* ------------------------------------------------------------
   GMM DATA GENERATION
------------------------------------------------------------ */

// Box–Muller standard normal
function sampleStandardNormal() {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

// Multivariate normal sample
function sampleMultivariateNormal(mean, cov) {
    const L = choleskyDecomposition(cov);

    const z = [sampleStandardNormal(), sampleStandardNormal()];

    const Lz = [
        L[0][0] * z[0] + L[0][1] * z[1],
        L[1][0] * z[0] + L[1][1] * z[1]
    ];

    return math.add(mean, Lz);
}

export function generateGMMData(k = 3, dim = 2, points_per_cluster = 200, lim = [-10, 10], scale = 5) {
    if (dim > 2) { // For now, limit to 2D for visualization in frontend
        dim = 2;
    }

    const trueParams = [];
    const allMeans = [];

    for (let i = 0; i < k; i++) {
        // Generate random mean within lim range
        const mean = Array.from({ length: dim }, () => Math.random() * (lim[1] - lim[0]) + lim[0]);
        allMeans.push(mean);

        // Generate random positive-definite covariance matrix
        // Similar to np.matmul(cov, cov.T)
        let covMatrix = math.zeros(dim, dim).valueOf();
        const randMatrix = math.matrix(Array.from({ length: dim }, () =>
            Array.from({ length: dim }, () => Math.random() * scale)
        ));
        covMatrix = math.multiply(randMatrix, math.transpose(randMatrix)).valueOf();

        // Ensure it's strictly positive definite by adding a small value to the diagonal
        for (let d = 0; d < dim; d++) {
            covMatrix[d][d] += 1e-6;
        }

        trueParams.push({ weight: 1 / k, mean: mean, cov: covMatrix });
    }

    const data = [];
    const labels = [];

    for (let i = 0; i < k; i++) {
        const params = trueParams[i];
        for (let j = 0; j < points_per_cluster; j++) {
            const sample = sampleMultivariateNormal(params.mean, params.cov);
            data.push(sample);
            labels.push(i);
        }
    }

    return { data, labels, trueParams };
}
