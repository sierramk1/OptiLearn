
import React, { useState } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';
import { generate_gmm_data, gmm_mle_objective } from '../../js/gmm_mle.js';

function ExamplesComponent() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleRunGMMExample = async () => {
    setError(null);
    setResults(null);

    try {
      const data = generate_gmm_data();
      let bestNComponents = -1;
      let bestScore = Infinity;

      for (let n = 2; n <= 10; n++) {
        const score = await gmm_mle_objective(data, n);
        if (score < bestScore) {
          bestScore = score;
          bestNComponents = n;
        }
      }

      setResults({
        best_n_components: bestNComponents,
        best_score: bestScore,
      });
    } catch (err) {
      setError('An error occurred during the GMM example: ' + err.message);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        GMM MLE Fitting Example
      </Typography>
      <Typography variant="body1" gutterBottom>
        Click the button below to run a Gaussian Mixture Model Maximum Likelihood Estimation example. This will generate synthetic data and find the optimal number of components using a simplified k-means approach.
      </Typography>
      <Button
        onClick={handleRunGMMExample}
        variant="contained"
        sx={{ mt: 2, backgroundColor: '#72A8C8', '&:hover': { backgroundColor: '#5a8fa8' } }}
      >
        Run GMM Example
      </Button>
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      {results && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6">Optimization Results</Typography>
          <Typography>Best number of components: {results.best_n_components}</Typography>
          <Typography>Best score (sum of squared distances): {results.best_score.toFixed(2)}</Typography>
        </Paper>
      )}
    </Box>
  );
}

export default ExamplesComponent;
