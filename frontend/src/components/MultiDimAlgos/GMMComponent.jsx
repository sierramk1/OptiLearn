
import React, { useState } from 'react';
import { Button, Box, Typography, Paper } from '@mui/material';

function GMMComponent() {
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleOptimize = () => {
    setError(null);
    setResults(null);

    // Assume a backend endpoint that runs the Optuna optimization for GMM
    fetch('/api/optimize-gmm', {
      method: 'POST',
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setResults(data);
      })
      .catch(error => {
        setError('There was a problem with the fetch operation: ' + error.message);
      });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <Typography variant="body2" sx={{ fontSize: "1em", lineHeight: 1.75, marginBottom: 1 }}>
        Gaussian Mixture Model (GMM) Maximum Likelihood Estimation (MLE) fitting.
        This will generate synthetic data from a GMM and then use Optuna to find the optimal number of components for the model.
      </Typography>
      <Button
        onClick={handleOptimize}
        variant="contained"
        fullWidth
        sx={{ mt: 2, backgroundColor: '#72A8C8', '&:hover': { backgroundColor: '#5a8fa8' } }}
      >
        Run GMM MLE Optimization
      </Button>
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
      {results && (
        <Paper sx={{ mt: 2, p: 2 }}>
          <Typography variant="h6">Optimization Results</Typography>
          <Typography>Best number of components: {results.best_n_components}</Typography>
          <Typography>Best log-likelihood: {results.best_log_likelihood}</Typography>
        </Paper>
      )}
    </Box>
  );
}

export default GMMComponent;
