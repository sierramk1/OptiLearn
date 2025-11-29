
import React, { useState, useEffect, useCallback, useRef } from "react";
import { TextField, Button, Alert, Typography, Box, Grid } from "@mui/material";
import GraphWithControls from "../common/GraphWithControls.jsx";
import * as math from 'mathjs';
import { solveGoldenSearch } from '../../js/golden_search.js';
import { createInterpolatedFunction } from '../../js/utils.js';

function GoldenSearchComponent({ optimizationType, data }) {
  // Input states
  const [funcString, setFuncString] = useState("x^3 - x - 1");
  const [aValue, setAValue] = useState("0");
  const [bValue, setBValue] = useState("0.5");
  const [cValue, setCValue] = useState("2");
  const [tolerance, setTolerance] = useState("1e-6");
  const [maxIterations, setMaxIterations] = useState("100");

  // Animation states
  const [animationSteps, setAnimationSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // Output states
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [errorFields, setErrorFields] = useState({});
  const [plotData, setPlotData] = useState([]);

  // Plot scaling states
  const [staticXBounds, setStaticXBounds] = useState([0, 0]);
  const [staticYBounds, setStaticYBounds] = useState([0, 0]);

  // Toggle state for graph/description
  const [showGraph, setShowGraph] = useState(true);

  const myFunction = useCallback(
    (x) => {
        if (optimizationType === 'function') {
            try {
                return math.evaluate(funcString, { x: x });
            } catch (err) {
                return NaN;
            }
        } else if (optimizationType === 'data' && data) {
            // Use the client-side createInterpolatedFunction
            const interpolatedFunc = createInterpolatedFunction(data);
            return interpolatedFunc(x);
        }
        return NaN;
    },
    [funcString, optimizationType, data]
  );

  const handleOptimize = async () => {
    setError(null);
    setErrorFields({});
    setResult(null);
    setAnimationSteps([]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const a = parseFloat(aValue);
    const b = parseFloat(bValue);
    const c = parseFloat(cValue);
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    if (tol <= 0 || maxIter <= 0) {
        setError('Tolerance and Max Iterations must be greater than 0 for this algorithm.');
        return;
    }

    // Validation
    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setError('Please enter valid numbers for a, b, and c.');
      return;
    }

    if (!(a < b && b < c)) {
      setError('The condition a < b < c must be met.');
      return;
    }

    const fa = myFunction(a);
    const fb = myFunction(b);
    const fc = myFunction(c);

    if (!(fb < fa && fb < fc)) {
      setError('The condition f(b) < f(a) and f(b) < f(c) must be met to bracket a minimum.');
      return;
    }

    try {
      // Call the client-side solveGoldenSearch function
      const result = solveGoldenSearch(
        optimizationType,
        funcString, // expression
        { a, b, c },    // initialGuess
        data,        // data (will be used if optimizationType is 'data')
        tol,         // tolerance
        maxIter      // maxIterations
      );

      setAnimationSteps(result.steps);
      setResult(result.minimum);

    } catch (err) {
      setError(err.message || 'An error occurred during optimization.');
    }
  };

  // --- Animation Control and Navigations ---
  useEffect(() => {
    if (
      isPlaying &&
      animationSteps.length > 0 &&
      currentStepIndex < animationSteps.length - 1
    ) {
      intervalRef.current = setInterval(() => {
        setCurrentStepIndex((prevIndex) => prevIndex + 1);
      }, 700);
    } else if (currentStepIndex >= animationSteps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, animationSteps]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) =>
      Math.min(animationSteps.length - 1, prev + 1)
    );
  };

  useEffect(() => {
    const a = parseFloat(aValue);
    const c = parseFloat(cValue);

    if (isNaN(a) || isNaN(c) || a >= c) {
        setPlotData([]);
        return;
    }

    const initialPlotRangeStart = Math.min(a, c) - Math.abs(c - a) * 0.5;
    const initialPlotRangeEnd = Math.max(a, c) + Math.abs(c - a) * 0.5;

    const numPoints = 200;
    const x_temp_plot = Array.from(
      { length: numPoints },
      (_, i) =>
        initialPlotRangeStart +
        (i * (initialPlotRangeEnd - initialPlotRangeStart)) / (numPoints - 1)
    );
    const y_temp_plot = x_temp_plot.map((x) => myFunction(x));

    const finiteYValues = y_temp_plot.filter((y) => isFinite(y));
    if (finiteYValues.length === 0) {
      setStaticYBounds([-1, 1]);
    } else {
      const yMin = Math.min(...finiteYValues);
      const yMax = Math.max(...finiteYValues);
      const yAxisPadding = (yMax - yMin) * 0.1 || 0.1;
      setStaticYBounds([yMin - yAxisPadding, yMax + yAxisPadding]);
    }
    setStaticXBounds([initialPlotRangeStart, initialPlotRangeEnd]);

    const newPlotData = [
        {
          x: x_temp_plot,
          y: y_temp_plot,
          type: "scatter",
          mode: "lines",
          name: optimizationType === 'function' ? `f(x) = ${funcString}` : 'Interpolated Function',
        },
      ];

      if (animationSteps.length > 0) {
        const currentStep = animationSteps[currentStepIndex];
        const { a, b, c, x, new_a, new_c } = currentStep;

        // Kept and Discarded Intervals
        const keptInterval = [new_a, new_c];
        const discardedInterval1 = [a, new_a];
        const discardedInterval2 = [new_c, c];

        let isFirstDiscarded = true;
        // Discarded regions
        if (discardedInterval1[1] > discardedInterval1[0]) {
            newPlotData.push({
                x: [discardedInterval1[0], discardedInterval1[1], discardedInterval1[1], discardedInterval1[0], discardedInterval1[0]],
                y: [staticYBounds[0], staticYBounds[0], staticYBounds[1], staticYBounds[1], staticYBounds[0]],
                type: 'scatter',
                fill: 'toself',
                fillcolor: 'rgba(255, 0, 0, 0.2)',
                line: { color: 'transparent' },
                name: 'Discarded',
                showlegend: isFirstDiscarded,
            });
            isFirstDiscarded = false;
        }
        if (discardedInterval2[1] > discardedInterval2[0]) {
            newPlotData.push({
                x: [discardedInterval2[0], discardedInterval2[1], discardedInterval2[1], discardedInterval2[0], discardedInterval2[0]],
                y: [staticYBounds[0], staticYBounds[0], staticYBounds[1], staticYBounds[1], staticYBounds[0]],
                type: 'scatter',
                fill: 'toself',
                fillcolor: 'rgba(255, 0, 0, 0.2)',
                line: { color: 'transparent' },
                name: 'Discarded',
                showlegend: isFirstDiscarded,
            });
            isFirstDiscarded = false;
        }

        // Kept region
        newPlotData.push({
          x: [keptInterval[0], keptInterval[1], keptInterval[1], keptInterval[0], keptInterval[0]],
          y: [staticYBounds[0], staticYBounds[0], staticYBounds[1], staticYBounds[1], staticYBounds[0]],
          type: 'scatter',
          fill: 'toself',
          fillcolor: 'rgba(0, 255, 0, 0.2)',
          line: { color: 'transparent' },
          name: 'Kept',
        });

        // Plot points
        // Bounds (a, c)
        newPlotData.push({
            x: [a, c],
            y: [myFunction(a), myFunction(c)],
            mode: 'markers',
            type: 'scatter',
            name: 'Bounds (a, c)',
            marker: { color: 'red', symbol: 'circle', size: 10 }
        });
        // Current Min (b)
        newPlotData.push({
            x: [b],
            y: [myFunction(b)],
            mode: 'markers',
            type: 'scatter',
            name: 'Current Min (b)',
            marker: { color: 'blue', symbol: 'diamond', size: 10 }
        });
        // Test Point (x)
        newPlotData.push({
            x: [x],
            y: [myFunction(x)],
            mode: 'markers',
            type: 'scatter',
            name: 'Test Point (x)',
            marker: { color: 'orange', symbol: 'cross', size: 10 }
        });
      }
      setPlotData(newPlotData);

  }, [funcString, aValue, cValue, optimizationType, data, myFunction, result, animationSteps, currentStepIndex]);

  return (
    <div
      style={{
        padding: "0px",
        margin: "0px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: "20px",
          flex: 1,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            width: "40%",
            paddingRight: "10px",
            marginLeft: "20px",
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontSize: "1em", lineHeight: 1.75, marginBottom: 1 }}
          >
            The Golden Search Method is a bracketing optimization algorithm that finds a minimum on an interval without requiring derivatives. It maintains a pair of interior points chosen using the golden ratio, ensuring that when the interval is reduced, one of the points can be reused. The method repeatedly narrows the interval around the minimum in this proportion until it converges.
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: 'italic', marginBottom: 2 }}
          >
            Note: The choice of starting points or interval can affect which root or minimum is found, especially for functions with multiple solutions.
          </Typography>

          <Grid container spacing={2} sx={{ width: "100%" }}>
            {optimizationType === 'function' && (
                <>
                <Grid item xs={12}>
                <TextField
                    label="Function f(x)"
                    value={funcString}
                    onChange={(e) => setFuncString(e.target.value)}
                    error={errorFields.funcString}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Tolerance"
                    type="number"
                    value={tolerance}
                    onChange={(e) => {
                        if (parseFloat(e.target.value) >= 0 || e.target.value === "") {
                            setTolerance(e.target.value);
                        }
                    }}
                    error={errorFields.tolerance}
                    variant="outlined"
                    size="small"
                    fullWidth
                    inputProps={{ step: "1e-7" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max Iterations"
                    type="number"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(e.target.value)}
                    error={errorFields.maxIterations}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </Grid>
                </>
            )}
            {optimizationType === 'data' && (
                <>
                <Grid item xs={6}>
                  <TextField
                    label="Tolerance"
                    type="number"
                    value={tolerance}
                    onChange={(e) => {
                        if (parseFloat(e.target.value) >= 0 || e.target.value === "") {
                            setTolerance(e.target.value);
                        }
                    }}
                    error={errorFields.tolerance}
                    variant="outlined"
                    size="small"
                    fullWidth
                    inputProps={{ step: "1e-7" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Max Iterations"
                    type="number"
                    value={maxIterations}
                    onChange={(e) => setMaxIterations(e.target.value)}
                    error={errorFields.maxIterations}
                    variant="outlined"
                    size="small"
                    fullWidth
                  />
                </Grid>
                </>
            )}
            <Grid item xs={4}>
              <TextField
                label="Point a"
                type="number"
                value={aValue}
                onChange={(e) => setAValue(e.target.value)}
                error={errorFields.a}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Point b"
                type="number"
                value={bValue}
                onChange={(e) => setBValue(e.target.value)}
                error={errorFields.b}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Point c"
                type="number"
                value={cValue}
                onChange={(e) => setCValue(e.target.value)}
                error={errorFields.c}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>

          <Button onClick={handleOptimize} variant="contained" sx={{ backgroundColor: '#72A8C8', '&:hover': { backgroundColor: '#5a8fa8' } }}>Optimize</Button>

          {result !== null && (
            <Typography
              variant="body2"
              sx={{ marginTop: 1, fontSize: "1.2em" }}
            >
              <strong>Final Minimum:</strong>{" "}
              <strong>{result.toFixed(6)}</strong>
            </Typography>
          )}
          {animationSteps.length > 0 && (
            <Typography variant="body2" sx={{ marginTop: 1, fontSize: "1.2em" }}>
              Iteration: {currentStepIndex + 1} / {animationSteps.length}
            </Typography>
          )}

          {error && (
            <Alert
              severity="warning"
              sx={{ fontSize: "1em", padding: "12px", marginTop: 1 }}
            >
              {error}
            </Alert>
          )}
        </Box>

        <div
          style={{
            width: "60%",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <GraphWithControls
            plotData={plotData}
            layout={{
              width: "100%",
              height: "100%",
              title: {
                text: optimizationType === 'function' ? `Plot of f(x) = ${funcString}`: 'Plot of Interpolated Function',
                font: { size: 14 },
              },
              xaxis: {
                title: { text: "x", font: { size: 12 } },
                range: staticXBounds,
              },
              yaxis: {
                title: { text: "f(x)", font: { size: 12 } },
                range: staticYBounds,
              },
              hovermode: "closest",
              margin: { l: 50, r: 30, t: 40, b: 40 },
              autosize: true,
            }}
            config={{ responsive: true }}
            showGraph={showGraph}
            onToggleGraph={() => setShowGraph(!showGraph)}
            animationSteps={animationSteps}
            currentStepIndex={currentStepIndex}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onPrevStep={handlePrevStep}
            onNextStep={handleNextStep}
            onReset={handleReset}
            pseudocodeContent={
                <>
                  <h4>Golden Section Search Pseudocode</h4>
                  <pre
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: '500px', overflowY: 'auto' }}
                  >
                    {`# Pseudocode for the Golden Section Search Method

FUNCTION GoldenSectionSearch(f, a0, b0, c0, tol, max_iter)

  // INPUTS:
  // f: Objective function to minimize
  // a0, b0, c0: Initial points, with f(a0) > f(b0) < f(c0)
  // tol: Desired tolerance
  // max_iter: Maximum number of iterations

  fb = f(b0)
  gold = 0.38196     // (3 - sqrt(5)) / 2

  FOR iter FROM 1 TO max_iter DO

    // Compute next point
    mid = (a0 + c0) / 2
    IF b0 > mid THEN
        x = b0 + gold * (a0 - b0)
    ELSE
        x = b0 + gold * (c0 - b0)
    END IF

    fx = f(x)

    // Update interval
    IF fx < fb THEN
        IF x > b0 THEN a0 = b0 ELSE c0 = b0
        b0 = x
        fb = fx
    ELSE
        IF x < b0 THEN a0 = x ELSE c0 = x
    END IF

    // Check convergence
    IF abs(c0 - a0) < abs(b0) * tol THEN
        RETURN b0
    END IF

  END FOR

  RETURN b0
END FUNCTION


`}
                  </pre>
                </>
              }
          />
        </div>
      </div>
    </div>
  );
}

export default GoldenSearchComponent;
