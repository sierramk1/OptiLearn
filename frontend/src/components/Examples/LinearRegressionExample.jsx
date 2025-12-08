import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Slider, Button, Box, Typography } from '@mui/material';
import { generateLinearRegressionData } from '../../js/data_generators.js';
import { leastSquaresObjective, leastSquaresGradient, leastSquaresHessian } from '../../js/objective_functions.js';
import { gradientDescent } from '../../js/gradient_descent.js';
import { newtonsMethod } from '../../js/newtons_method.js';
import Description from './Description.jsx';
import LinearRegressionGraphWithControls from '../common/LinearRegressionGraphWithControls.jsx';
import * as math from 'mathjs';

function LinearRegressionExample() {
  const [n, setN] = useState(100);
  const [p, setP] = useState(2);
  const [noise, setNoise] = useState(0.5);
  const [maxIterations, setMaxIterations] = useState(100);
  const [data, setData] = useState(null);
  const [results, setResults] = useState({ gradientDescent: null, newtonsMethod: null });
  const [animationFrame, setAnimationFrame] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationIntervalRef = useRef(null);

  const handleGenerateData = () => {
    const generatedData = generateLinearRegressionData(n, p, noise);
    setData(generatedData);
    setResults({ gradientDescent: null, newtonsMethod: null }); // Clear previous results
    stopAnimation();
  };

  const runAllOptimizations = useCallback(() => {
    if (!data) return;

    const X = math.matrix(data.X);
    const y = math.matrix(data.y);
    const initialBeta = math.zeros(p).toArray();

    const objFunc = leastSquaresObjective(X, y);
    const gradFunc = leastSquaresGradient(X, y);

    // Run Gradient Descent
    const gdResult = gradientDescent(b => objFunc(math.matrix(b)), b => gradFunc(math.matrix(b)).toArray(), initialBeta, 0.0001, true, 1e-10, maxIterations);
    const gdPathValues = gdResult.path.map(point => objFunc(math.matrix(point)));
    setResults(prevResults => ({
      ...prevResults,
      gradientDescent: { ...gdResult, pathValues: gdPathValues }
    }));

    // Run Newton's Method
    if (p <= 10) {
      const hessianFunc = () => leastSquaresHessian(X);
      const nmResult = newtonsMethod(b => objFunc(math.matrix(b)), b => gradFunc(math.matrix(b)).toArray(), () => hessianFunc(), initialBeta, 1e-10, maxIterations);
      const nmPathValues = nmResult.path.map(point => objFunc(math.matrix(point)));
      setResults(prevResults => ({
        ...prevResults,
        newtonsMethod: { ...nmResult, pathValues: nmPathValues }
      }));
    }
    stopAnimation();
  }, [data, p, maxIterations]);

  const startAnimation = () => {
    stopAnimation(); // Stop any existing animation
    setAnimationFrame(0);
    setIsAnimating(true);
  };

  const stopAnimation = () => {
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }
    setIsAnimating(false);
  };

  useEffect(() => {
    if (isAnimating) {
      animationIntervalRef.current = setInterval(() => {
        setAnimationFrame(prevFrame => {
          const gdMaxFrames = results.gradientDescent ? results.gradientDescent.path.length - 1 : 0;
          const nmMaxFrames = results.newtonsMethod ? results.newtonsMethod.path.length - 1 : 0;
          const maxFrames = Math.max(gdMaxFrames, nmMaxFrames);

          if (prevFrame >= maxFrames) {
            clearInterval(animationIntervalRef.current);
            setIsAnimating(false);
            return maxFrames;
          }
          return prevFrame + 1;
        });
      }, 700);
    } else {
      clearInterval(animationIntervalRef.current);
    }
    return () => clearInterval(animationIntervalRef.current);
  }, [isAnimating, results.gradientDescent, results.newtonsMethod, animationFrame]);


  const getPredictedLine = (beta) => {
    if (!data || !beta) return null;
    const x_vals = data.X.map(row => row[0]);
    const x_range = [Math.min(...x_vals), Math.max(...x_vals)];
    // Simplified for 2D plotting: y = b0*x + b1
    const y_predicted = x_range.map(x => beta[0] * x + (p > 1 ? beta[1] : 0));
    return { x: x_range, y: y_predicted };
  };

  const trueLine = data ? getPredictedLine(data.trueBeta) : null;
  const gdEstimatedLine = results.gradientDescent ? getPredictedLine(results.gradientDescent.xmin) : null;
  const nmEstimatedLine = results.newtonsMethod ? getPredictedLine(results.newtonsMethod.xmin) : null;

  const gdAnimationLine = results.gradientDescent ? getPredictedLine(results.gradientDescent.path[Math.min(animationFrame, results.gradientDescent.path.length - 1)]) : null;
  const nmAnimationLine = results.newtonsMethod ? getPredictedLine(results.newtonsMethod.path[Math.min(animationFrame, results.newtonsMethod.path.length - 1)]) : null;

  const plotData = data ? [
    { x: data.X.map(row => row[0]), y: data.y, mode: 'markers', type: 'scatter', name: 'Data' },
    trueLine && { ...trueLine, mode: 'lines', name: 'True Line', line: { color: 'green', width: 2 } },
    ...(gdAnimationLine ? [{ ...gdAnimationLine, mode: 'lines', name: 'Gradient Descent Path', line: { color: 'orange', width: 3 } }] : []),
    ...(nmAnimationLine ? [{ ...nmAnimationLine, mode: 'lines', name: 'Newton\'s Method Path', line: { color: 'red', width: 3 } }] : [])
  ].filter(Boolean) : [];


  const buttonSx = {
    backgroundColor: '#72A8C8',
    '&:hover': {
      backgroundColor: '#5A86A4',
    },
  };

  const sliderSx = {
    color: '#72A8C8',
  };

  const maxAnimationFrames = Math.max(
    results.gradientDescent ? results.gradientDescent.path.length - 1 : 0,
    results.newtonsMethod ? results.newtonsMethod.path.length - 1 : 0
  );

  return (
    <div>
      <Box sx={{ display: 'flex', gap: '20px' }}>
        {/* Parameters and Data Summary on the left */}
        <Box sx={{ width: 300, padding: '20px', flexShrink: 0 }}>
          <Typography variant="h4" sx={{ color: '#333', fontWeight: 'bold', marginBottom: '20px' }}>
            Linear Regression
          </Typography>
          <>
            <Typography gutterBottom>Sample Size (n)</Typography>
            <Slider sx={sliderSx} value={n} onChange={(e, val) => setN(val)} min={10} max={1000} step={10} valueLabelDisplay="auto" />
            <Typography gutterBottom>Number of Predictors (p)</Typography>
            <Slider sx={sliderSx} value={p} onChange={(e, val) => setP(val)} min={1} max={10} step={1} valueLabelDisplay="auto" />
            <Typography gutterBottom>Noise Level</Typography>
            <Slider sx={sliderSx} value={noise} onChange={(e, val) => setNoise(val)} min={0} max={5} step={0.1} valueLabelDisplay="auto" />
            <Typography gutterBottom>Max Iterations</Typography>
            <Slider sx={sliderSx} value={maxIterations} onChange={(e, val) => setMaxIterations(val)} min={10} max={5000} step={10} valueLabelDisplay="auto" />
            <Button variant="contained" onClick={handleGenerateData} sx={{ ...buttonSx, marginTop: '20px' }}>
              Generate Data
            </Button>
            {data && (
              <Box sx={{ marginTop: '20px' }}>
                <Button variant="contained" onClick={runAllOptimizations} sx={buttonSx}>
                  Run Optimization
                </Button>
              </Box>
            )}
            {data && (results.gradientDescent || results.newtonsMethod) && (
              <Typography variant="body1" sx={{ marginTop: '20px' }}>
                Iteration: {animationFrame} / {maxAnimationFrames}
              </Typography>
            )}
          </>
        </Box>

        {/* Data Plot and Results on the right */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {data && (
            <Box sx={{ padding: '20px', height: '450px', marginBottom: '20px' }}>
              <Typography variant="h6">Data (y vs. First Predictor)</Typography>
              <LinearRegressionGraphWithControls
                plotData={plotData}
                layout={{ title: 'Generated Data', xaxis: { title: 'X1' }, yaxis: { title: 'y' }, autosize: true }}
                animationSteps={Array(maxAnimationFrames + 1).fill(0)} // Dummy array for slider max
                currentStepIndex={animationFrame}
                isPlaying={isAnimating}
                onPlayPause={() => setIsAnimating(!isAnimating)}
                onPrevStep={() => setAnimationFrame(Math.max(0, animationFrame - 1))}
                onNextStep={() => setAnimationFrame(Math.min(maxAnimationFrames, animationFrame + 1))}
                onReset={() => setAnimationFrame(0)}
                onSliderChange={(val) => setAnimationFrame(val)}
              />
              <Typography>True Beta: [{data.trueBeta.map(b => b.toFixed(3)).join(', ')}]</Typography>
            </Box>
          )}

          <Box sx={{ flex: 1, display: 'flex', gap: '20px', minWidth: 0 }}>
            {/* Gradient Descent Results */}
            <Box sx={{ flex: 1, padding: '20px', minWidth: 0 }}>
              <Typography variant="h6">Gradient Descent</Typography>
              {results.gradientDescent ? (
                <>
                  <Box sx={{ height: '300px' }}>
                    <LinearRegressionGraphWithControls
                      plotData={[{
                        x: Array.from({ length: results.gradientDescent.pathValues.length }, (_, i) => i),
                        y: results.gradientDescent.pathValues,
                        type: 'scatter', mode: 'lines+markers', name: 'Objective Value'
                      }]}
                      layout={{ title: 'Convergence Plot', xaxis: { title: 'Iteration' }, yaxis: { title: 'Objective Value' }, autosize: true }}
                      animationSteps={[]} // No animation for this plot
                    />
                  </Box>
                  <Box sx={{ wordWrap: 'break-word' }}>
                    <Typography>Estimated Beta: [{results.gradientDescent.xmin.map(b => b.toFixed(3)).join(', ')}]</Typography>
                    <Typography>Iterations: {results.gradientDescent.iter}</Typography>
                    <Typography>Converged: {results.gradientDescent.convergence ? 'True' : 'False'}</Typography>
                  </Box>
                </>
              ) : <Typography>Run optimization to see results.</Typography>}
            </Box>

            {/* Newton's Method Results */}
            <Box sx={{ flex: 1, padding: '20px', minWidth: 0 }}>
              <Typography variant="h6">Newton's Method</Typography>
              {p > 10 ? <Typography>Not available for p > 10.</Typography> : (results.newtonsMethod ? (
                <>
                  <Box sx={{ height: '300px' }}>
                    <LinearRegressionGraphWithControls
                      plotData={[{
                        x: Array.from({ length: results.newtonsMethod.pathValues.length }, (_, i) => i),
                        y: results.newtonsMethod.pathValues,
                        type: 'scatter', mode: 'lines+markers', name: 'Objective Value'
                      }]}
                      layout={{ title: 'Convergence Plot', xaxis: { title: 'Iteration' }, yaxis: { title: 'Objective Value' }, autosize: true }}
                      animationSteps={[]} // No animation for this plot
                    />
                  </Box>
                  <Box sx={{ wordWrap: 'break-word' }}>
                    <Typography>Estimated Beta: [{results.newtonsMethod.xmin.map(b => b.toFixed(3)).join(', ')}]</Typography>
                    <Typography>Iterations: {results.newtonsMethod.iter}</Typography>
                    <Typography>Converged: {results.newtonsMethod.convergence ? 'True' : 'False'}</Typography>
                  </Box>
                </>
              ) : <Typography>Run optimization to see results.</Typography>)}
            </Box>
          </Box>
          <Description />
        </Box>
      </Box>
    </div>
  );
}

export default LinearRegressionExample;
