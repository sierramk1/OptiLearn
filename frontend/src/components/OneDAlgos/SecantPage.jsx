import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Typography, Box, Grid, ToggleButton, ToggleButtonGroup, AppBar, Toolbar, Menu, MenuItem, IconButton } from "@mui/material";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import GraphWithControls from "../common/GraphWithControls.jsx";
import * as math from 'mathjs';
import { solveSecant } from '../../js/secant.js';
import { createInterpolatedFunction } from '../../js/utils.js';
import oneDAlgorithmsData from './oneDAlgorithmsData.js';

function SecantPage() {
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
      const resultSteps = solveSecant(
        optimizationType,
        funcString,
        { x0, x1 },
        data,
        tol,
        maxIter,
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
            const interpolatedFunc = createInterpolatedFunction(data, interpolationType);
            return interpolatedFunc(x);
        }
        return NaN;
    },
    [funcString, optimizationType, data, interpolationType]
  );

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

        newPlotData.push({
          x: [currentX0, currentX1],
          y: [myFunction(currentX0), myFunction(currentX1)],
          mode: "markers",
          marker: { color: "red", size: 10, symbol: "circle" },
          name: "Current Points (x0, x1)",
        });

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

        newPlotData.push({
          x: [currentX2],
          y: [0], // This y value might need adjustment based on context
          mode: "markers",
          marker: { color: "purple", size: 10, symbol: "circle" },
          name: "Next Guess (x_n+1)",
        });
      }
      setPlotData(newPlotData);

  }, [funcString, x0Value, x1Value, optimizationType, data, myFunction, result, animationSteps, currentStepIndex, interpolationType]);

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
            Secant Method
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {oneDAlgorithmsData.map((algo) => (
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

  FUNCTION Secant(f, x0, x1, tol, max_iter)

  // INPUTS:
  // f: Function whose root we want to find
  // x0, x1: Initial guesses
  // tol: Desired tolerance
  // max_iter: Maximum number of iterations

  FOR iter FROM 1 TO max_iter DO

    fx0 = f(x0)
    fx1 = f(x1)

    IF abs(fx1) < tol THEN
      RETURN x1
    END IF

    // Calculate next approximation
    x_next = x1 - fx1 * (x1 - x0) / (fx1 - fx0)

    // Update guesses
    x0 = x1
    x1 = x_next

  END FOR

  RETURN x1
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

export default SecantPage;