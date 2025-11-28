
import numpy as np
from sklearn.mixture import GaussianMixture

def generate_gmm_data(n_samples=1000, n_components=3, random_state=42):
    """
    Generates synthetic data from a Gaussian Mixture Model.
    """
    np.random.seed(random_state)
    
    # Define the parameters for the GMM
    means = np.array([[-2], [0], [3]])
    weights = np.array([0.3, 0.5, 0.2])
    covariances = np.array([[0.5], [0.1], [0.8]])
    
    # Generate the data
    X = np.vstack([
        np.random.normal(loc=means[i], scale=np.sqrt(covariances[i]), size=(int(n_samples * weights[i]), 1))
        for i in range(n_components)
    ])
    
    return X

def gmm_mle_objective(trial):
    """
    Objective function for GMM MLE fitting using Optuna.
    """
    # Generate synthetic data
    X = generate_gmm_data()
    
    # Suggest hyperparameters for the GMM
    n_components = trial.suggest_int('n_components', 2, 10)
    
    # Fit the GMM
    gmm = GaussianMixture(n_components=n_components, random_state=42)
    gmm.fit(X)
    
    # Return the log-likelihood (to be maximized)
    return gmm.score(X)
