
import React, { useState, useEffect, useCallback, useRef } from "react";
import { TextField, Button, Alert, Typography, Box, Grid, ToggleButton, ToggleButtonGroup } from "@mui/material";
import GraphWithControls from "../common/GraphWithControls.jsx";
import * as math from 'mathjs';
import { solveSecant } from '../../js/secant.js';
import { createInterpolatedFunction } from '../../js/utils.js';

function SecantComponent({ optimizationType, data }) {
  // Input states
  const [funcString, setFuncString] = useState("x^3 - x - 1");
  const [x0Value, setX0Value] = useState("1");
  const [x1Value, setX1Value] = useState("2");
  const [tolerance, setTolerance] = useState("1e-6");
  const [maxIterations, setMaxIterations] = useState("100");
  const [interpolationType, setInterpolationType] = useState('cubic');

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

    const x0 = parseFloat(x0Value);
    const x1 = parseFloat(x1Value);
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    if (tol <= 0 || maxIter <= 0) {
        setError('Tolerance and Max Iterations must be greater than 0 for this algorithm.');
        return;
    }

    // Validation
    if (isNaN(x0) || isNaN(x1)) {
      setError('Please enter valid numbers for initial guesses x0 and x1.');
      return;
    }

    if (optimizationType === 'data' && data && data.length > 0) {
        const minDataX = Math.min(...data.map(p => p.x));
        const maxDataX = Math.max(...data.map(p => p.x));
        if (x0 < minDataX || x0 > maxDataX || x1 < minDataX || x1 > maxDataX) {
            setError(`Initial guesses x0 and x1 must be within the range of the provided data [${minDataX.toFixed(2)}, ${maxDataX.toFixed(2)}].`);
            return;
        }
    }

    try {
      // Call the client-side solveSecant function
      const resultSteps = solveSecant(
        optimizationType,
        funcString, // expression
        { x0, x1 },  // initialGuess
        data,        // data (will be used if optimizationType is 'data')
        tol,         // tolerance
        maxIter,      // maxIterations
        interpolationType
      );

      setAnimationSteps(resultSteps);
      setResult(resultSteps[resultSteps.length - 1].x2);

    } catch (err) {
      setError(err.message || 'An error occurred during optimization.');
    }
  };

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
            const interpolatedFunc = createInterpolatedFunction(data, interpolationType);
            return interpolatedFunc(x);
        }
        return NaN;
    },
    [funcString, optimizationType, data, interpolationType]
  );

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
    const x0 = parseFloat(x0Value);
    const x1 = parseFloat(x1Value);

    if (isNaN(x0) || isNaN(x1)) {
        setPlotData([]);
        return;
    }

    const initialPlotRangeStart = optimizationType === 'data' && data && data.length > 0
        ? Math.min(...data.map(p => p.x))
        : Math.min(x0, x1) - 2;
    const initialPlotRangeEnd = optimizationType === 'data' && data && data.length > 0
        ? Math.max(...data.map(p => p.x))
        : Math.max(x0, x1) + 2;

    const numPoints = 200;
    const x_temp_plot = Array.from(
      { length: numPoints },
      (_, i) =>
        initialPlotRangeStart +
        (i * (initialPlotRangeEnd - initialPlotRangeStart)) / (numPoints - 1)
    );
    const y_temp_plot = x_temp_plot.map((x) => myFunction(x));

    // Filter out NaN values for plotting the main function line
    const validPoints = x_temp_plot.map((x, i) => ({ x, y: y_temp_plot[i] }))
                                   .filter(p => isFinite(p.y));

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
          x: validPoints.map(p => p.x),
          y: validPoints.map(p => p.y),
          type: "scatter",
          mode: "lines",
          name: optimizationType === 'function' ? `f(x) = ${funcString}` : 'Interpolated Function',
        },
      ];

      if (animationSteps.length > 0) {
        const currentStep = animationSteps[currentStepIndex];
        const { x0: currentX0, x1: currentX1, x2: currentX2 } = currentStep;

        // Plot current points on the curve
        newPlotData.push({
          x: [currentX0, currentX1],
          y: [myFunction(currentX0), myFunction(currentX1)],
          mode: "markers",
          marker: { color: "red", size: 10, symbol: "circle" },
          name: "Current Points (x0, x1)",
        });

        // Secant line
        const slope = (myFunction(currentX1) - myFunction(currentX0)) / (currentX1 - currentX0);
        const intercept = myFunction(currentX0) - slope * currentX0;
        const secant_y_values = x_temp_plot.map((x) => slope * x + intercept);
        newPlotData.push({
          x: x_temp_plot,
          y: secant_y_values,
          mode: "lines",
          line: { color: "green", dash: "dash" },
          name: "Secant Line",
        });

        // Next guess on x-axis
        newPlotData.push({
          x: [currentX2],
          y: [0],
          mode: "markers",
          marker: { color: "purple", size: 10, symbol: "circle" },
          name: "Next Guess (x_n+1)",
        });
      }
      setPlotData(newPlotData);

  }, [funcString, x0Value, x1Value, optimizationType, data, myFunction, result, animationSteps, currentStepIndex, interpolationType]);

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
            The Secant Method is a root-finding algorithm that begins with two initial points and constructs a line (secant) through their function values. The x-intercept of this line becomes the next approximation of the root. The process repeats using the most recent two points, allowing the method to converge without requiring derivatives.
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
                <Grid item xs={12}>
                  <ToggleButtonGroup
                    color="primary"
                    value={interpolationType}
                    exclusive
                    onChange={(event, newType) => {
                      if (newType !== null) {
                        setInterpolationType(newType);
                      }
                    }}
                    aria-label="Interpolation Type"
                    size="small"
                    fullWidth
                  >
                    <ToggleButton value="cubic">Cubic Spline</ToggleButton>
                    <ToggleButton value="piecewise">Piecewise Linear</ToggleButton>
                  </ToggleButtonGroup>
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
            <Grid item xs={6}>
              <TextField
                label="Initial Guess x0"
                type="number"
                value={x0Value}
                onChange={(e) => setX0Value(e.target.value)}
                error={errorFields.x0}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Initial Guess x1"
                type="number"
                value={x1Value}
                onChange={(e) => setX1Value(e.target.value)}
                error={errorFields.x1}
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
              <strong>Final Root:</strong>{" "}
              <strong>{result.toFixed(6)}</strong>
            </Typography>
          )}
          {animationSteps.length > 0 && (
            <Typography variant="body2" sx={{ fontSize: "1.2em" }}>
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
                  <h4>Secant Method Pseudocode</h4>
                  <pre
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: '500px', overflowY: 'auto' }}
                  >
                    {`# Pseudocode for the Secant Method

FUNCTION SecantMethod(f, x0, x1, tol, max_iter)

  // INPUTS:
  // f: Function for which we are finding a root
  // x0, x1: Initial guesses
  // tol: Desired tolerance
  // max_iter: Maximum number of iterations

  FOR iter FROM 1 TO max_iter DO

    IF abs(f(x1)) < tol THEN
      RETURN x1
    END IF

    // Compute next approximation
    x_temp = x1 - f(x1) * (x1 - x0) / (f(x1) - f(x0))
    x0 = x1
    x1 = x_temp

  END FOR

  RETURN x1   // Return best guess after max_iter
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

export default SecantComponent;
