
import React, { useState, useEffect, useCallback, useRef } from "react";
import { TextField, Button, Alert, Typography, Box, Grid } from "@mui/material";
import GraphWithControls from "../common/GraphWithControls.jsx";
import * as math from 'mathjs';
import { solveBisection } from '../../js/bisection.js';
import { createInterpolatedFunction } from '../../js/utils.js';

function BisectionComponent({ optimizationType, data }) {
  // Input states
  const [funcString, setFuncString] = useState("x^3 - x - 1");
  const [aValue, setAValue] = useState("1");
  const [bValue, setBValue] = useState("2");
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
    const tol = parseFloat(tolerance);
    const maxIter = parseInt(maxIterations);

    try {
      // Call the client-side solveBisection function
      const resultSteps = solveBisection(
        optimizationType,
        funcString, // expression
        { a, b },    // initialGuess
        data,        // data (will be used if optimizationType is 'data')
        tol,         // tolerance
        maxIter      // maxIterations
      );

      setAnimationSteps(resultSteps);
      setResult(resultSteps[resultSteps.length - 1].c);

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
            const interpolatedFunc = createInterpolatedFunction(data);
            return interpolatedFunc(x);
        }
        return NaN;
    },
    [funcString, optimizationType, data]
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
    console.log("Plotting useEffect triggered.");
    console.log("animationSteps:", animationSteps);
    console.log("currentStepIndex:", currentStepIndex);

    const a = parseFloat(aValue);
    const b = parseFloat(bValue);

    if (isNaN(a) || isNaN(b) || a >= b) {
        setPlotData([]);
        return;
    }

    const initialPlotRangeStart = Math.min(a, b) - Math.abs(b - a) * 0.5;
    const initialPlotRangeEnd = Math.max(a, b) + Math.abs(b - a) * 0.5;

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
        const { a: currentA, b: currentB, c: currentC } = currentStep;

        // Active segment
        const x_active_segment = x_temp_plot.filter(
          (x_val) => x_val >= currentA && x_val <= currentB
        );
        const y_active_segment = x_active_segment.map((x_val) => myFunction(x_val));

        newPlotData.push({
          x: x_active_segment,
          y: y_active_segment,
          type: "scatter",
          mode: "lines",
          name: "f(x) in [a,b]",
          line: { color: "blue", width: 3 },
        });

        // Current A and B lines
        newPlotData.push({
          x: [currentA, currentA],
          y: staticYBounds,
          mode: "lines",
          line: { color: "red", dash: "dash" },
          name: "Current A",
        });
        newPlotData.push({
          x: [currentB, currentB],
          y: staticYBounds,
          mode: "lines",
          line: { color: "red", dash: "dash" },
          name: "Current B",
        });

        // Midpoint
        if (currentC !== null) {
          newPlotData.push({
            x: [currentC],
            y: [myFunction(currentC)],
            mode: "markers",
            marker: { color: "green", size: 10, symbol: "circle" },
            name: "Midpoint",
          });
        }

        // Y=0 line
        newPlotData.push({
          x: staticXBounds,
          y: [0, 0],
          mode: "lines",
          line: { color: "gray", dash: "dot" },
          name: "y=0",
        });
      }
      setPlotData(newPlotData);

  }, [funcString, aValue, bValue, optimizationType, data, myFunction, result, animationSteps, currentStepIndex]);

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
            The Bisection Method is a root-finding algorithm that starts with two points where the function has opposite signs, guaranteeing a root between them. The interval is repeatedly halved, and the sub-interval that still has opposite signs is kept until the method converges.
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
                    onChange={(e) => setTolerance(e.target.value)}
                    error={errorFields.tolerance}
                    variant="outlined"
                    size="small"
                    fullWidth
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
                label="Interval a"
                type="number"
                value={aValue}
                onChange={(e) => setAValue(e.target.value)}
                error={errorFields.a}
                variant="outlined"
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Interval b"
                type="number"
                value={bValue}
                onChange={(e) => setBValue(e.target.value)}
                error={errorFields.b}
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
                  <h4>Bisection Method Pseudocode</h4>
                  <pre
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: '500px', overflowY: 'auto' }}
                  >
                    {`# Pseudocode for the Bisection Method

  FUNCTION Bisection(f, a, b, tol, max_iter)

  // INPUTS:
  // f: Function whose root we want to find
  // a, b: Endpoints of the interval [a, b]
  // tol: Desired tolerance
  // max_iter: Maximum iterations

  // PRECONDITION: f(a) and f(b) must have opposite signs
  IF f(a) * f(b) >= 0 THEN
      OUTPUT "Error: Root not guaranteed (f(a) and f(b) must have opposite signs)."
      RETURN null
  END IF

  iterations = 0

  WHILE iterations < max_iter DO

      // Midpoint of the interval
      c = (a + b) / 2

      // CONVERGENCE CHECKS
      IF ABS(f(c)) < tol OR (b - a)/2 < tol THEN
          RETURN c
      END IF

      // INTERVAL UPDATE
      IF f(a) * f(c) < 0 THEN
          b = c
      ELSE
          a = c
      END IF

      iterations = iterations + 1

  END WHILE

  OUTPUT "Method did not converge in the allotted iterations."
  RETURN (a + b) / 2

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

export default BisectionComponent;
