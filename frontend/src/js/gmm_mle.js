import math from './math_config.js';

// Helper function to calculate the PDF of a multivariate normal distribution
function multivariateNormalPDF(x, mean, cov) {
    const k = x.length;
    const detCov = math.det(cov);
    if (detCov <= 0) {
        // Return a very small number if covariance is singular or not positive definite
        return 1e-10;
    }
    const invCov = math.inv(cov);
    const diff = math.subtract(x, mean);
    const exponent = -0.5 * math.multiply(math.multiply(math.transpose(diff), invCov), diff);
    const denominator = Math.sqrt(Math.pow(2 * Math.PI, k) * detCov);
    return Math.exp(exponent) / denominator;
}

// Initializes parameters for the GMM
function initializeParams(data, nComponents) {
    const nSamples = data.length;
    const shuffledData = [...data].sort(() => 0.5 - Math.random());
    
    const means = shuffledData.slice(0, nComponents);
    const weights = Array(nComponents).fill(1 / nComponents);
    const covariances = Array(nComponents).fill(math.identity(2).valueOf());

    return { weights, means, covariances };
}

// E-Step: Calculate responsibilities
function eStep(data, params) {
    const nSamples = data.length;
    const nComponents = params.weights.length;
    const responsibilities = Array(nSamples).fill(0).map(() => Array(nComponents).fill(0));

    for (let i = 0; i < nSamples; i++) {
        const x = data[i];
        let denominator = 0;
        for (let k = 0; k < nComponents; k++) {
            const likelihood = multivariateNormalPDF(x, params.means[k], params.covariances[k]);
            const numerator = params.weights[k] * likelihood;
            responsibilities[i][k] = numerator;
            denominator += numerator;
        }
        if (denominator > 0) {
            for (let k = 0; k < nComponents; k++) {
                responsibilities[i][k] /= denominator;
            }
        }
    }
    return responsibilities;
}

// M-Step: Update parameters
function mStep(data, responsibilities) {
    const nSamples = data.length;
    const nComponents = responsibilities[0].length;
    const dataDim = data[0].length;

    const Nk = Array(nComponents).fill(0);
    for (let k = 0; k < nComponents; k++) {
        for (let i = 0; i < nSamples; i++) {
            Nk[k] += responsibilities[i][k];
        }
    }

    const weights = Nk.map(nk => nk / nSamples);

    const means = Array(nComponents).fill(0).map(() => Array(dataDim).fill(0));
    for (let k = 0; k < nComponents; k++) {
        let weightedSum = Array(dataDim).fill(0);
        for (let i = 0; i < nSamples; i++) {
            const weightedX = math.multiply(data[i], responsibilities[i][k]);
            weightedSum = math.add(weightedSum, weightedX);
        }
        if (Nk[k] > 0) {
            means[k] = math.divide(weightedSum, Nk[k]).valueOf();
        }
    }

    const covariances = Array(nComponents).fill(0).map(() => math.zeros(dataDim, dataDim).valueOf());
    for (let k = 0; k < nComponents; k++) {
        let weightedSum = math.zeros(dataDim, dataDim);
        for (let i = 0; i < nSamples; i++) {
            const diff = math.subtract(data[i], means[k]);
            const outerProduct = math.multiply(math.transpose([diff]), [diff]);
            const weightedOuterProduct = math.multiply(outerProduct, responsibilities[i][k]);
            weightedSum = math.add(weightedSum, weightedOuterProduct);
        }
        if (Nk[k] > 0) {
            let cov = math.divide(weightedSum, Nk[k]);
            // Add a small regularization term to prevent singularity
            covariances[k] = math.add(cov, math.multiply(math.identity(dataDim), 1e-6)).valueOf();
        }
    }

    return { weights, means, covariances };
}

// Calculate log-likelihood
function calculateLogLikelihood(data, params) {
    const nSamples = data.length;
    let logLikelihood = 0;
    for (let i = 0; i < nSamples; i++) {
        let sampleLikelihood = 0;
        for (let k = 0; k < params.weights.length; k++) {
            sampleLikelihood += params.weights[k] * multivariateNormalPDF(data[i], params.means[k], params.covariances[k]);
        }
        if (sampleLikelihood > 0) {
            logLikelihood += Math.log(sampleLikelihood);
        }
    }
    return logLikelihood;
}

export function runEM(data, nComponents, maxIter = 100, tol = 1e-4) {
    let params = initializeParams(data, nComponents);
    const history = [];
    let logLikelihood = calculateLogLikelihood(data, params);
    let converged = false;

    for (let iter = 0; iter < maxIter; iter++) {
        const responsibilities = eStep(data, params);
        const assignments = responsibilities.map(r => r.indexOf(Math.max(...r)));
        
        history.push({
            ...params,
            logLikelihood,
            assignments
        });

        params = mStep(data, responsibilities);
        const newLogLikelihood = calculateLogLikelihood(data, params);

        if (Math.abs(newLogLikelihood - logLikelihood) < tol) {
            converged = true;
            break;
        }
        logLikelihood = newLogLikelihood;
    }

    // Add final state to history
    const responsibilities = eStep(data, params);
    const assignments = responsibilities.map(r => r.indexOf(Math.max(...r)));
    history.push({
        ...params,
        logLikelihood,
        assignments
    });

    return { history, converged };
}
