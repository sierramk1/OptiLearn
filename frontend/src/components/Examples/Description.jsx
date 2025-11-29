import React from 'react';
import { Box, Typography } from '@mui/material';

function Description() {
  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h6">Explanation</Typography>
      <Typography paragraph>
        In this example, you generate synthetic linear regression data by choosing:
      </Typography>
      <Box component="ul" sx={{ pl: 2, mb: 2 }}>
        <li><Typography>the sample size (n)</Typography></li>
        <li><Typography>the number of predictors (p)</Typography></li>
        <li><Typography>the noise level</Typography></li>
      </Box>
      <Typography paragraph>
        Once you generate the dataset, you’ll see the structure of X and the true coefficients that were used to create the data.
      </Typography>
      <Typography paragraph>
        Then, the tool automatically runs both Gradient Descent and Newton’s Method to minimize the least-squares objective:
      </Typography>
      <Typography align="center" sx={{ my: 2 }}>
        L(β) = ||y - Xβ||²
      </Typography>
      <Typography paragraph sx={{ mt: 2 }}>
        You can immediately compare the two methods side-by-side.
      </Typography>
      <Typography paragraph>
        For each algorithm, you’ll see:
      </Typography>
      <Box component="ul" sx={{ pl: 2, mb: 2 }}>
        <li><Typography>the estimated coefficients</Typography></li>
        <li><Typography>the number of iterations</Typography></li>
        <li><Typography>whether it converged</Typography></li>
        <li><Typography>a plot showing how the loss decreases over iterations</Typography></li>
      </Box>
      <Typography paragraph>
        This lets you directly see how Gradient Descent and Newton behave differently when solving the same optimization problem—how fast they move, how stable they are, and how quickly they reach the minimum.
      </Typography>
    </Box>
  );
}

export default Description;
