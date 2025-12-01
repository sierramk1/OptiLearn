import math from './math_config.js';

// Helper function for logsumexp
function logsumexp(arr, axis = 0) {
    if (arr.length === 0) {
        return -Infinity;
    }
    const maxVal = Math.max(...arr);
    const sumExp = arr.reduce((sum, val) => sum + Math.exp(val - maxVal), 0);
    return maxVal + Math.log(sumExp);
}

// Helper function to calculate the log-PDF of a multivariate normal distribution
function multivariateNormalLogPDF(x, mean, cov) {
    const k = x.length;
    const detCov = math.det(cov);
    console.log("multivariateNormalLogPDF: detCov:", detCov);
    if (detCov <= 0) {
        console.log("multivariateNormalLogPDF: detCov <= 0, returning -Infinity.");
        return -Infinity;
    }
    const invCov = math.inv(cov);
    console.log("multivariateNormalLogPDF: invCov:", invCov);
    const diff = math.subtract(x, mean);
    console.log("multivariateNormalLogPDF: diff:", diff);
    // Correct outer product calculation: diff^T * invCov * diff
    const diffMatrix = math.matrix(diff);
    const diffTransposed = math.transpose(diffMatrix); // (2x1)

    const term1 = math.multiply(diffTransposed, invCov); // (2x1) * (2x2) = invalid
    // This is still incorrect. The order should be (1x2) * (2x2) * (2x1)
    // Let's re-think the quadratic form x^T A x

    // The quadratic form is diff^T * invCov * diff
    // diff is a 1D array [d1, d2]
    // invCov is a 2x2 matrix
    // We need to calculate [d1 d2] * [[a b], [c d]] * [[d1], [d2]]

    const diffRowVector = math.matrix([diff]); // 1x2 matrix
    const diffColVector = math.transpose(diffRowVector); // 2x1 matrix

    const term1_corrected = math.multiply(diffRowVector, invCov); // (1x2) * (2x2) = 1x2
    console.log("multivariateNormalLogPDF: term1_corrected (diffRowVector * invCov):", term1_corrected);
    const term2_corrected = math.multiply(term1_corrected, diffColVector); // (1x2) * (2x1) = 1x1
    console.log("multivariateNormalLogPDF: term2_corrected (term1_corrected * diffColVector):", term2_corrected);
    const exponent = -0.5 * term2_corrected.valueOf()[0][0]; // Extract scalar
    console.log("multivariateNormalLogPDF: exponent:", exponent);
    const logDenominator = 0.5 * (k * Math.log(2 * Math.PI) + Math.log(detCov));
    console.log("multivariateNormalLogPDF: logDenominator:", logDenominator);
    const logPdf = exponent - logDenominator;
    console.log("multivariateNormalLogPDF: logPdf:", logPdf);
    return logPdf;
}

// Helper function to calculate the PDF of a multivariate normal distribution
function multivariateNormalPDF(x, mean, cov) {
    return Math.exp(multivariateNormalLogPDF(x, mean, cov));
}

/* ------------------------------------------------------------
   K-means++ initialization
------------------------------------------------------------ */
function kmeansPlusPlus(data, k) {
    const nSamples = data.length;
    const centroids = [];

    // 1. Choose one center uniformly at random from the data points.
    const firstCentroidIndex = Math.floor(Math.random() * nSamples);
    centroids.push(data[firstCentroidIndex]);

    const distances = Array(nSamples).fill(Infinity);

    // Helper to calculate squared Euclidean distance
    const squaredDistance = (p1, p2) => {
        let sum = 0;
        for (let i = 0; i < p1.length; i++) {
            sum += (p1[i] - p2[i]) ** 2;
        }
        return sum;
    };

    while (centroids.length < k) {
        let totalDistance = 0;

        // For each data point, compute its distance to the nearest center already chosen
        for (let i = 0; i < nSamples; i++) {
            let minDistance = Infinity;
            for (let j = 0; j < centroids.length; j++) {
                const dist = squaredDistance(data[i], centroids[j]);
                if (dist < minDistance) {
                    minDistance = dist;
                }
            }
            distances[i] = minDistance;
            totalDistance += minDistance;
        }

        // Choose new center with probability proportional to D(x)^2
        const r = Math.random() * totalDistance;
        let cumulativeProbability = 0;
        let newCentroidIndex = -1;

        for (let i = 0; i < nSamples; i++) {
            cumulativeProbability += distances[i];
            if (cumulativeProbability >= r) {
                newCentroidIndex = i;
                break;
            }
        }
        if (newCentroidIndex !== -1) {
            centroids.push(data[newCentroidIndex]);
        } else {
            // Fallback if for some reason a centroid wasn't picked (e.g., numerical precision)
            centroids.push(data[Math.floor(Math.random() * nSamples)]);
        }
    }
    return centroids;
}

/* ------------------------------------------------------------
   Initialize GMM parameters
------------------------------------------------------------ */
function initializeParams(data, k) {
    const nSamples = data.length;
    const dim = data[0].length;

    // Initialize means using K-means++
    const means = kmeansPlusPlus(data, k);

    // Initialize covariance matrices based on data variance
    const dataMatrix = math.matrix(data);
    const variances = math.variance(dataMatrix, 0).valueOf(); // Variance along each dimension

    const covs = Array(k).fill(null).map(() => {
        const cov = math.diag(variances).valueOf(); // Diagonal matrix with variances
        // Regularize the covariance matrix
        for (let d = 0; d < dim; d++) {
            cov[d][d] += 1e-6; // Add a small value to the diagonal
        }
        return cov;
    });

    const weights = Array(k).fill(1 / k); // Equal weights for each cluster

    return { weights, means, covariances: covs };
}

// E-Step: Calculate responsibilities
function eStep(data, params) {
    const nSamples = data.length;
    const nComponents = params.weights.length;
    const logResponsibilities = Array(nSamples).fill(0).map(() => Array(nComponents).fill(0));

    for (let i = 0; i < nSamples; i++) {
        const x = data[i];
        const logLikelihoods = [];
        for (let k = 0; k < nComponents; k++) {
            const logPi_k = Math.log(params.weights[k]);
            const logPdf = multivariateNormalLogPDF(x, params.means[k], params.covariances[k]);
            logLikelihoods.push(logPi_k + logPdf);
        }

        const logSumExpLikelihoods = logsumexp(logLikelihoods);

        for (let k = 0; k < nComponents; k++) {
            logResponsibilities[i][k] = logLikelihoods[k] - logSumExpLikelihoods;
        }
    }
    // Convert log-responsibilities back to normal space
    const responsibilities = logResponsibilities.map(row => row.map(val => Math.exp(val)));
    return responsibilities;
}

/* ------------------------------------------------------------
   M-step
------------------------------------------------------------ */
function mStep(data, resp) {
  console.log("mStep: started.");
  const n = data.length;
  const k = resp[0].length;
  const dim = data[0].length;

  const Nk = Array(k).fill(0);
  const means = Array(k).fill(null).map(() => math.zeros(dim).valueOf()); // Initialize as plain arrays
  const covs = Array(k).fill(null).map(() => math.zeros(dim, dim).valueOf());

  for (let j = 0; j < k; j++) {
      console.log("mStep: Processing component j:", j);
      let weightedSumX = math.zeros(dim);
      for (let i = 0; i < n; i++) {
          Nk[j] += resp[i][j];
          weightedSumX = math.add(weightedSumX, math.multiply(data[i], resp[i][j]));
      }
      console.log("mStep: Nk[j]:", Nk[j], "weightedSumX:", weightedSumX);

      // Update Mean
      if (Nk[j] > 0) {
          means[j] = math.divide(weightedSumX, Nk[j]).valueOf();
          console.log("mStep: Updated mean for component", j, ":", means[j]);
      }

      // Covariance
      if (Nk[j] > 0) {
          let weightedSumCov = math.zeros(dim, dim);
          for (let i = 0; i < n; i++) {
              console.log("mStep: Covariance update for sample i:", i);
              const diff = math.subtract(data[i], means[j]);
              console.log("mStep: diff:", diff);
              const diffColumn = math.matrix(diff).resize([dim, 1]); // Create as a column vector
              console.log("mStep: diffColumn:", diffColumn);
              const diffRow = math.matrix(diff).resize([1, dim]);       // Create as a row vector
              console.log("mStep: diffRow:", diffRow);
              const outerProduct = math.multiply(diffColumn, diffRow); // (2x1) * (1x2) = 2x2
              console.log("mStep: outerProduct:", outerProduct);
              const weightedOuterProduct = math.multiply(outerProduct, resp[i][j]);
              console.log("mStep: weightedOuterProduct:", weightedOuterProduct);
              weightedSumCov = math.add(weightedSumCov, weightedOuterProduct);
              console.log("mStep: weightedSumCov (after add):", weightedSumCov);
          }
          let cov = math.divide(weightedSumCov, Nk[j]);
          // Add a small regularization term to prevent singularity
          covs[j] = math.add(cov, math.multiply(math.identity(dim), 1e-6)).valueOf();
          console.log("mStep: Updated covariance for component", j, ":", covs[j]);
      }
  }

  const weights = Nk.map(nk => nk / n);
  console.log("mStep: Weights calculated:", weights);
  console.log("mStep: finished.");
  return { weights, means, covariances: covs };
}

// Calculate log-likelihood
function calculateLogLikelihood(data, params) {
    const nSamples = data.length;
    let totalLogLikelihood = 0;

    for (let i = 0; i < nSamples; i++) {
        const x = data[i];
        const logLikelihoods = [];
        for (let k = 0; k < params.weights.length; k++) {
            const logPi_k = Math.log(params.weights[k]);
            const logPdf = multivariateNormalLogPDF(x, params.means[k], params.covariances[k]);
            logLikelihoods.push(logPi_k + logPdf);
        }
        totalLogLikelihood += logsumexp(logLikelihoods);
    }
    return totalLogLikelihood;
}

/* ------------------------------------------------------------
   EXPORT: runEM
------------------------------------------------------------ */
export function runEM(data, k, maxIter = 100, tol = 1e-4) {
  console.log("runEM started with k:", k, "maxIter:", maxIter, "tol:", tol);
  let params = initializeParams(data, k);
  let prevLL = -Infinity;
  const history = [];

      for (let iter = 0; iter < maxIter; iter++) {
          console.log("Iteration:", iter);
          console.log("Calling eStep...");
          const resp = eStep(data, params);
          console.log("eStep returned. Responsibilities shape:", resp.length, resp[0].length);
          console.log("Calling mStep...");
          const newParams = mStep(data, resp);
          console.log("mStep returned. New means:", newParams.means);
          console.log("Calling calculateLogLikelihood...");
          const ll = calculateLogLikelihood(data, newParams);
          console.log("calculateLogLikelihood returned. Log-Likelihood:", ll);
  
          history.push({
              logLikelihood: ll,
              assignments: resp.map(r => r.indexOf(Math.max(...r))),
              means: newParams.means,
              covariances: newParams.covariances,
              weights: newParams.weights
          });
  
          if (Math.abs(ll - prevLL) < tol) {
              console.log("Converged at iteration:", iter);
              return { history, converged: true };
          }
  
          params = newParams;
          prevLL = ll;
      }
  console.log("Max iterations reached. Not converged.");
  return { history, converged: false };
}
