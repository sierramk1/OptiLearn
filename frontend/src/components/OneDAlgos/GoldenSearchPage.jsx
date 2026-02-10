
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Typography, Box, Grid, ToggleButton, ToggleButtonGroup, AppBar, Toolbar, Menu, MenuItem, IconButton } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import GraphWithControls from "../common/GraphWithControls.jsx";
import * as math from 'mathjs';
import { solveGoldenSearch } from '../../js/golden_search.js';
import { createInterpolatedFunction } from '../../js/utils.js';
import oneDAlgorithms from './oneDAlgorithmsData';

function GoldenSearchPage() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    navigate(path);
    handleMenuClose();
  };
  // Input states
  const [funcString, setFuncString] = useState("x^3 - x - 1");
  const [aValue, setAValue] = useState("0");
  const [bValue, setBValue] = useState("0.5");
  const [cValue, setCValue] = useState("2");
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

  const [optimizationType, setOptimizationType] = useState('function');
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);

  const handleOptimizationTypeChange = (event, newType) => {
    if (newType !== null) {
      setOptimizationType(newType);
    }
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csv = e.target.result;
        const parsedData = csv.split('\n')
          .filter(row => {
            const trimmedRow = row.trim();
            return trimmedRow !== '' && 
                   !trimmedRow.startsWith('x,y') &&
                   (trimmedRow.charAt(0) === '-' || (trimmedRow.charAt(0) >= '0' && trimmedRow.charAt(0) <= '9'));
          })
          .map(row => {
            const parts = row.split(',').map(Number);
            if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              return { x: parts[0], y: parts[1] };
            }
            return null;
          })
          .filter(p => p !== null);
        setData(parsedData);
      };
      reader.readAsText(file);
    }
  };

  useEffect(() => {
    if (optimizationType === 'data' && data && data.length >= 3) {
      for (let i = 1; i < data.length - 1; i++) {
        if (data[i].y < data[i-1].y && data[i].y < data[i+1].y) {
          setAValue(data[i-1].x.toString());
          setBValue(data[i].x.toString());
          setCValue(data[i+1].x.toString());
          return;
        }
      }
    }
  }, [data, optimizationType]);

  const myFunction = useCallback(
    (x) => {
        if (optimizationType === 'function') {
            try {
                return math.evaluate(funcString, { x: x });
            } catch (err) {
                return NaN;
            }
        } else if (optimizationType === 'data' && data) {
            const interpolatedFunc = createInterpolatedFunction(data, interpolationType);
            return interpolatedFunc(x);
        }
        return NaN;
    },
    [funcString, optimizationType, data, interpolationType]
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

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setError('Please enter valid numbers for a, b, and c.');
      return;
    }

    if (!(a < b && b < c)) {
      setError('The condition a < b < c must be met.');
      return;
    }

    if (optimizationType === 'data' && data && data.length > 0) {
        const minDataX = Math.min(...data.map(p => p.x));
        const maxDataX = Math.max(...data.map(p => p.x));
        if (a < minDataX || a > maxDataX || b < minDataX || b > maxDataX || c < minDataX || c > maxDataX) {
            setError(`Initial points a, b, and c must be within the range of the provided data [${minDataX.toFixed(2)}, ${maxDataX.toFixed(2)}].`);
            return;
        }
    }

    const fa = myFunction(a);
    const fb = myFunction(b);
    const fc = myFunction(c);

    if (!(fb < fa && fb < fc)) {
      let errorMessage = 'The condition f(b) < f(a) and f(b) < f(c) must be met to bracket a minimum.';
      if (optimizationType === 'data' && interpolationType === 'piecewise') {
        errorMessage += ' With piecewise linear interpolation, try choosing initial points a, b, and c that coincide with your data points, ensuring b is a local minimum in your data.';
      }
      setError(errorMessage);
      return;
    }

    try {
      const result = solveGoldenSearch(
        optimizationType,
        funcString,
        { a, b, c },
        data,
        tol,
        maxIter,
        interpolationType
      );

      setAnimationSteps(result.steps);
      setResult(result.minimum);

    } catch (err) {
      setError(err.message || 'An error occurred during optimization.');
    }
  };

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

    const initialPlotRangeStart = optimizationType === 'data' && data && data.length > 0
        ? Math.min(...data.map(p => p.x))
        : Math.min(a, c) - Math.abs(c - a) * 0.5;
    const initialPlotRangeEnd = optimizationType === 'data' && data && data.length > 0
        ? Math.max(...data.map(p => p.x))
        : Math.max(a, c) + Math.abs(c - a) * 0.5;

    const numPoints = 200;
    const x_temp_plot = Array.from(
      { length: numPoints },
      (_, i) =>
        initialPlotRangeStart +
        (i * (initialPlotRangeEnd - initialPlotRangeStart)) / (numPoints - 1)
    );
    const y_temp_plot = x_temp_plot.map((x) => myFunction(x));

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
        const { a, b, c, x, new_a, new_c } = currentStep;

        const keptInterval = [new_a, new_c];
        const discardedInterval1 = [a, new_a];
        const discardedInterval2 = [new_c, c];

        let isFirstDiscarded = true;
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

        newPlotData.push({
          x: [keptInterval[0], keptInterval[1], keptInterval[1], keptInterval[0], keptInterval[0]],
          y: [staticYBounds[0], staticYBounds[0], staticYBounds[1], staticYBounds[1], staticYBounds[0]],
          type: 'scatter',
          fill: 'toself',
          fillcolor: 'rgba(0, 255, 0, 0.2)',
          line: { color: 'transparent' },
          name: 'Kept',
        });

        newPlotData.push({
            x: [a, c],
            y: [myFunction(a), myFunction(c)],
            mode: 'markers',
            type: 'scatter',
            name: 'Bounds (a, c)',
            marker: { color: 'red', symbol: 'circle', size: 10 }
        });
        newPlotData.push({
            x: [b],
            y: [myFunction(b)],
            mode: 'markers',
            type: 'scatter',
            name: 'Current Min (b)',
            marker: { color: 'blue', symbol: 'diamond', size: 10 }
        });
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

  }, [funcString, aValue, cValue, optimizationType, data, myFunction, result, animationSteps, currentStepIndex, interpolationType]);

  return (
    <div style={{ 
      padding: '0px', 
      backgroundColor: '#F4F2EF',
      fontFamily: 'Roboto, Arial, sans-serif' 
    }}>
      <AppBar 
        position="static" 
        sx={{
          backgroundColor: '#FFF5E6',
          height: '77px',
          boxShadow: 'none',
          borderBottom: '1px solid #ccc'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', padding: '0 20px' }}>
          <Link 
            to="/" 
            style={{ 
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img 
              src="/character.png" 
              alt="Owl Character" 
              style={{ maxWidth: '50px', height: 'auto', marginRight: '10px' }} 
            />
            <Typography
              variant="h4"
              sx={{
                color: '#72A8C8',
                fontFamily: 'Roboto',
                fontWeight: '700',
                fontSize: '38px',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              OptiLearn
            </Typography>
          </Link>

          <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Button
              component={Link}
              to="/one-dimensional"
              sx={{
                color: '#3C667E',
                fontSize: '1.2em',
                fontWeight: 'bold',
                textDecoration: 'none',
                textTransform: 'none',
                minWidth: '180px',
                padding: '0',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              One-Dimensional
            </Button>
            <Button
              component={Link}
              to="/multi-dimensional"
              sx={{
                color: '#666',
                fontSize: '1.2em',
                fontWeight: 'normal',
                textDecoration: 'none',
                textTransform: 'none',
                minWidth: '180px',
                padding: '0',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Multi-Dimensional
            </Button>
            <Button
              component={Link}
              to="/gen-ai-guide"
              sx={{
                color: '#666',
                fontSize: '1.2em',
                fontWeight: 'normal',
                textDecoration: 'none',
                textTransform: 'none',
                minWidth: '180px',
                padding: '0',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Gen-AI Guide
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <div style={{ padding: '20px', minHeight: 'calc(100vh - 77px)', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            onClick={handleMenuClick}
            sx={{
              backgroundColor: '#72A8C8',
              '&:hover': { backgroundColor: '#5a8fa8' },
              color: 'white',
              borderRadius: '25px', // Oval shape
              textTransform: 'none',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              padding: '10px 25px', // Adjust padding for oval shape
              marginBottom: '20px', // Space between button and content below
            }}
            endIcon={<ArrowDropDownIcon />}
          >
            Golden Search Method
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {oneDAlgorithms.map((algo) => (
              <MenuItem key={algo.name} onClick={() => handleMenuItemClick(algo.route)}>
                {algo.name}
              </MenuItem>
            ))}
          </Menu>
          
          <ToggleButtonGroup
            value={optimizationType}
            exclusive
            onChange={handleOptimizationTypeChange}
            aria-label="optimization type"
            sx={{ marginBottom: '20px' }} // Add margin bottom to align with button's margin
          >
            <ToggleButton value="function" aria-label="function optimization">
              Function
            </ToggleButton>
            <ToggleButton value="data" aria-label="data optimization">
              Data
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {optimizationType === 'data' && (
          <div style={{ padding: '10px 20px 10px 20px' }}>
            <Box sx={{ border: '1px solid #ccc', borderRadius: '4px', padding: '10px', backgroundColor: '#f7f7f7', marginBottom: '10px' }}>
              <Typography variant="body1" sx={{ width: '100%' }}>
                To get started, click Choose File to select a two-column CSV containing your x and y values, then choose an interpolation method—cubic spline or piecewise linear—to turn your data into a function, and click Upload. Once the function is plotted, you can run any of the optimization algorithms to estimate where the minimum occurs.
              </Typography>
            </Box>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".csv"
            />
            <Button onClick={handleFileUpload} variant="contained" sx={{ backgroundColor: '#72A8C8', '&:hover': { backgroundColor: '#5a8fa8' } }}>Upload</Button>
          </div>
        )}

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
              Note: The choice of starting points or interval can affect which root or minimum is found, especially for functions with multiple solutions. Additionally, the objective function must be unimodal within the search interval for the Golden Search algorithm to guarantee convergence to the global minimum.
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
                          }}              config={{ responsive: true }}
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
    </div>
  );
}

export default GoldenSearchPage;
