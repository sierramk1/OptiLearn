import math from './math_config.js';

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

// --- GMM Data Generation ---

// Using Box-Muller transform to get a value from a standard normal distribution
function sampleStandardNormal() {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function sampleMultivariateNormal(mean, cov) {
    const L = math.cholesky(cov).valueOf();
    const z = [sampleStandardNormal(), sampleStandardNormal()];
    const Lz = math.multiply(L, z);
    return math.add(mean, Lz);
}

export function generateGMMData(nSamples, nComponents, seed = null) {
    if (seed) {
        // Basic seeding - not a full-fledged PRNG, but makes generation deterministic
        math.config({ randomSeed: String(seed) });
    }

    const predefinedParams = [
        { weight: 0.3, mean: [2, 2], cov: [[1, 0.5], [0.5, 1]] },
        { weight: 0.5, mean: [-3, -1], cov: [[1.5, -0.7], [-0.7, 1.5]] },
        { weight: 0.2, mean: [1, -4], cov: [[0.8, 0], [0, 0.8]] },
        { weight: 0.4, mean: [-5, 5], cov: [[1.2, 0.3], [0.3, 1]] },
        { weight: 0.3, mean: [5, -5], cov: [[0.5, -0.2], [-0.2, 0.7]] },
    ];

    const trueParams = predefinedParams.slice(0, nComponents);
    // Normalize weights
    const totalWeight = trueParams.reduce((sum, p) => sum + p.weight, 0);
    trueParams.forEach(p => p.weight /= totalWeight);

    const data = [];
    const labels = [];

    for (let i = 0; i < nSamples; i++) {
        // Choose a component based on weights
        const r = Math.random();
        let cumulativeWeight = 0;
        let componentIndex = 0;
        for (let j = 0; j < nComponents; j++) {
            cumulativeWeight += trueParams[j].weight;
            if (r < cumulativeWeight) {
                componentIndex = j;
                break;
            }
        }

        const params = trueParams[componentIndex];
        const sample = sampleMultivariateNormal(params.mean, params.cov);
        data.push(sample.valueOf());
        labels.push(componentIndex);
    }

    return { data, labels, trueParams };
}