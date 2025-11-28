
import kmeans from 'kmeans-js';

/**
 * Generates synthetic data from a Gaussian Mixture Model.
 * @param {number} n_samples - The total number of samples to generate.
 * @param {number} n_components - The number of GMM components.
 * @returns {Array<Array<number>>} - The generated data.
 */
export function generate_gmm_data(n_samples = 1000, n_components = 3) {
    const means = [[-2, -2], [0, 0], [3, 3]];
    const weights = [0.3, 0.5, 0.2];
    const covariances = [[[0.5, 0.1], [0.1, 0.5]], [[0.1, 0], [0, 0.1]], [[0.8, -0.2], [-0.2, 0.8]]];

    const data = [];
    for (let i = 0; i < n_components; i++) {
        const n = Math.floor(n_samples * weights[i]);
        const mean = means[i];
        const cov = covariances[i];

        for (let j = 0; j < n; j++) {
            const sample = [
                Math.random() * cov[0][0] + mean[0],
                Math.random() * cov[1][1] + mean[1]
            ];
            data.push(sample);
        }
    }
    return data;
}

/**
 * Simplified GMM objective function using k-means.
 * @param {Array<Array<number>>} data - The input data.
 * @param {number} n_components - The number of components to try.
 * @returns {Promise<number>} - A promise that resolves with the k-means score (sum of squared distances).
 */
export function gmm_mle_objective(data, n_components) {
    return new Promise((resolve, reject) => {
        const kmeansResult = kmeans(data, n_components);
        if (!kmeansResult) {
            return reject(new Error('k-means failed to return a result.'));
        }
        const score = kmeansResult.reduce((acc, cluster) => {
            return acc + cluster.clusterInd.reduce((dist, pointIndex) => {
                const point = data[pointIndex];
                return dist + Math.pow(point[0] - cluster.centroid[0], 2) + Math.pow(point[1] - cluster.centroid[1], 2);
            }, 0);
        }, 0);
        resolve(score);
    });
}
