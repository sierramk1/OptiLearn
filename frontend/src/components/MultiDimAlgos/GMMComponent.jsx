import React, { useState, useEffect, useRef } from 'react';
import { Button, Box, Typography, Paper, Grid, Slider, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Plot from 'react-plotly.js';
import { generateGMMData } from '../../js/data_generators.js';
import { runEM } from '../../js/gmm_mle.js';
import math from '../../js/math_config.js';
import { eigenDecomposition2x2 } from '../../js/math_linear_algebra.js';
import GraphWithControls from '../common/GraphWithControls';

function GMMComponent() {
    // UI Controls State
    const [nSamples, setNSamples] = useState(400);
    const [nComponents, setNComponents] = useState(3);
    const [maxIterations, setMaxIterations] = useState(100);
    const [tolerance, setTolerance] = useState(1e-4);

    // Data State
    const [data, setData] = useState([]);
    const [trueParams, setTrueParams] = useState([]);

    // EM State
    const [emHistory, setEmHistory] = useState([]);
    const [converged, setConverged] = useState(false);
    const [error, setError] = useState(null);

    // Animation State
    const [currentIteration, setCurrentIteration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef(null);
    const [showGraph, setShowGraph] = useState(true);

    const handleGenerateData = () => {
        try {
            setError(null);
            setEmHistory([]);
            setCurrentIteration(0);
            // nSamples is now total samples, so points_per_cluster = nSamples / nComponents
            const pointsPerCluster = Math.floor(nSamples / nComponents);
            const { data: generatedData, trueParams: generatedParams } = generateGMMData(nComponents, 2, pointsPerCluster);
            setData(generatedData);
            setTrueParams(generatedParams);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleRunEM = () => {
        if (data.length === 0) {
            setError("Please generate data first.");
            return;
        }
        try {
            setError(null);
            console.log("Calling runEM...");
            const { history, converged: emConverged } = runEM(data, nComponents, maxIterations, tolerance);
            console.log("runEM returned. History length:", history.length, "Converged:", emConverged);
            setEmHistory(history);
            setConverged(emConverged);
            setCurrentIteration(0);
            console.log("emHistory state after set:", history);
            console.log("Converged state after set:", emConverged);
        } catch (e) {
            setError(e.message);
        }
    };

    const handlePlayPause = () => {
        setIsPlaying(prev => !prev);
    };

    const handlePrevStep = () => {
        setCurrentIteration(prev => Math.max(0, prev - 1));
    };

    const handleNextStep = () => {
        setCurrentIteration(prev => Math.min(emHistory.length - 1, prev + 1));
    };

    const handleReset = () => {
        setCurrentIteration(0);
        setIsPlaying(false);
    };

    const handleToggleGraph = () => {
        setShowGraph(prev => !prev);
    };

    useEffect(() => {
        if (isPlaying && currentIteration < emHistory.length - 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIteration(prev => prev + 1);
            }, 500);
        } else {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, currentIteration, emHistory]);
    
    useEffect(() => {
        handleGenerateData();
    }, []);

    const getEllipse = (mean, cov, scale = 2) => {
        const eig = eigenDecomposition2x2(cov);
        const [λ1, λ2] = eig.values;
        const [v1, v2] = eig.vectors;

        const angle = Math.atan2(v1[1], v1[0]);
        const a = scale * Math.sqrt(λ1);
        const b = scale * Math.sqrt(λ2);

        const N = 100;
        let t = [...Array(N).keys()].map(i => (i / (N - 1)) * 2 * Math.PI);

        const x = t.map(theta => a * Math.cos(theta));
        const y = t.map(theta => b * Math.sin(theta));

        const pointsX = [];
        const pointsY = [];

        for (let i = 0; i < N; i++) {
            const rx = mean[0] + x[i] * Math.cos(angle) - y[i] * Math.sin(angle);
            const ry = mean[1] + x[i] * Math.sin(angle) + y[i] * Math.cos(angle);
            pointsX.push(rx);
            pointsY.push(ry);
        }

        return { x: pointsX, y: pointsY };
    };


    const currentEMState = emHistory[currentIteration];

    const clusterPlotData = [
        {
            x: data.map(d => d[0]),
            y: data.map(d => d[1]),
            mode: 'markers',
            type: 'scatter',
            marker: { 
                color: currentEMState ? currentEMState.assignments.map(a => a) : 'grey',
                colorscale: 'Viridis',
                size: 5
            },
            name: 'Data'
        }
    ];

    const ellipseShapes = [];
    if (currentEMState) {
        clusterPlotData.push({
            x: currentEMState.means.map(m => m[0]),
            y: currentEMState.means.map(m => m[1]),
            mode: 'markers',
            type: 'scatter',
            marker: { color: 'red', size: 12, symbol: 'cross' },
            name: 'Estimated Means'
        });

        currentEMState.covariances.forEach((cov, i) => {
            const ellipse = getEllipse(currentEMState.means[i], cov);
            const path = ellipse.x.map((vx, i) => `${vx},${ellipse.y[i]}`).join(' L ');
            ellipseShapes.push({
                type: 'path',
                path: `M ${path} Z`,
                line: { color: 'red', width: 1 },
            });
        });
    }

    const logLikelihoodData = emHistory.length > 0 ? [
        {
            x: emHistory.map((_, i) => i),
            y: emHistory.map(h => h.logLikelihood),
            mode: 'lines+markers',
            type: 'scatter',
            name: 'Log-Likelihood'
        }
    ] : [];

    return (
        <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6">GMM Parameters</Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography>Number of Samples: {nSamples}</Typography>
                            <Slider value={nSamples} onChange={(e, v) => setNSamples(v)} min={200} max={1000} step={10} sx={{ color: '#72A8C8' }} />
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Typography>Number of Components: {nComponents}</Typography>
                            <Slider value={nComponents} onChange={(e, v) => setNComponents(v)} min={2} max={5} step={1} sx={{ color: '#72A8C8' }} />
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Typography>Max Iterations:</Typography>
                            <TextField
                                fullWidth
                                type="number"
                                value={maxIterations}
                                onChange={(e) => setMaxIterations(Number(e.target.value))}
                                inputProps={{ min: 1, step: 1 }}
                                variant="outlined"
                                size="small"
                            />
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Typography>Tolerance:</Typography>
                            <TextField
                                fullWidth
                                type="number"
                                value={tolerance}
                                onChange={(e) => setTolerance(Number(e.target.value))}
                                inputProps={{ min: 1e-6, step: 1e-5 }}
                                variant="outlined"
                                size="small"
                            />
                        </Box>

                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button variant="contained" onClick={handleGenerateData} sx={{ backgroundColor: '#72A8C8', '&:hover': { backgroundColor: '#5a8fa8' } }}>Generate Data</Button>
                            <Button variant="contained" onClick={handleRunEM} sx={{ backgroundColor: '#72A8C8', '&:hover': { backgroundColor: '#5a8fa8' } }}>Run EM</Button>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                    <GraphWithControls
                        plotData={clusterPlotData}
                        layout={{
                            title: `GMM Clusters (Iteration: ${currentIteration})`,
                            xaxis: { title: 'x1' },
                            yaxis: { title: 'x2' },
                            shapes: ellipseShapes,
                            showlegend: false,
                            autosize: true,
                            margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 }
                        }}
                        config={{ responsive: true }}
                        isPlaying={isPlaying}
                        onPlayPause={handlePlayPause}
                        onPrevStep={handlePrevStep}
                        onNextStep={handleNextStep}
                        onReset={handleReset}
                        animationSteps={emHistory}
                        currentStepIndex={currentIteration}
                        error={error}
                        showGraph={showGraph}
                        onToggleGraph={handleToggleGraph}
                        pseudocodeContent={
                            <Box>
                                <Typography variant="h6">Expectation-Maximization (EM) Algorithm for GMM Examples</Typography>
                                <Typography component="pre" sx={{ bgcolor: '#f4f4f4', p: 2, borderRadius: 1, overflowX: 'auto' }}>
                                    {`1. Initialization:
   - Randomly initialize means (μ_k), covariances (Σ_k), and mixing coefficients (π_k) for each of K components.

2. Expectation (E-step):
   - Calculate the responsibility r_nk that component k takes for data point x_n:
     r_nk = π_k * N(x_n | μ_k, Σ_k) / Σ_j (π_j * N(x_n | μ_j, Σ_j))
     where N is the multivariate Gaussian distribution.

3. Maximization (M-step):
   - Update the parameters based on the responsibilities:
     - New means: μ_k_new = Σ_n (r_nk * x_n) / N_k
     - New covariances: Σ_k_new = Σ_n (r_nk * (x_n - μ_k_new)(x_n - μ_k_new)^T) / N_k
     - New mixing coefficients: π_k_new = N_k / N
     where N_k = Σ_n r_nk (effective number of points assigned to component k) and N is total data points.

4. Convergence Check:
   - Calculate the log-likelihood of the data.
   - If the change in log-likelihood between iterations is below a tolerance, or max iterations reached, stop. Otherwise, repeat from E-step.`}
                                </Typography>
                            </Box>
                        }
                    />
                </Grid>
            </Grid>
            
            {emHistory.length > 0 && (
                <Box sx={{mt: 2}}>
                    <Typography><Box component="span" fontWeight="bold">Final log-likelihood:</Box> {emHistory[emHistory.length-1].logLikelihood.toFixed(4).toLocaleString()}</Typography>
                    <Typography><Box component="span" fontWeight="bold">Number of EM iterations:</Box> {emHistory.length - 1}</Typography>
                    <Typography><Box component="span" fontWeight="bold">Converged:</Box> {converged.toString().charAt(0).toUpperCase() + converged.toString().slice(1)}</Typography>
                </Box>
            )}

            {/* Log-Likelihood Plot - Kept separate for now */}
            {emHistory.length > 0 && (
                <Grid container spacing={2} sx={{mt: 2}}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2 }}>
                            <Plot
                                data={logLikelihoodData}
                                layout={{
                                    title: 'Log-Likelihood vs. Iteration',
                                    xaxis: { title: 'Iteration' },
                                    yaxis: { title: 'Log-Likelihood' },
                                    shapes: emHistory.length > 0 ? [
                                        {
                                            type: 'line',
                                            x0: currentIteration, x1: currentIteration,
                                            y0: Math.min(...emHistory.map(h => h.logLikelihood)), y1: Math.max(...emHistory.map(h => h.logLikelihood)),
                                            line: { color: 'red', width: 2, dash: 'dot' }
                                        }
                                    ] : []
                                }}
                                style={{ width: '100%', height: '300px' }}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Grid container spacing={2} sx={{mt: 2}}>
                <Grid item xs={12} md={6}>
                    {trueParams.length > 0 && (
                        <TableContainer component={Paper}>
                            <Typography variant="h6" sx={{p: 2}}>True GMM Parameters</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Component</TableCell>
                                        <TableCell>Weight</TableCell>
                                        <TableCell>Mean</TableCell>
                                        <TableCell>Covariance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {trueParams.map((p, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell>{p.weight.toFixed(2)}</TableCell>
                                            <TableCell>{`[${p.mean.map(m => m.toFixed(2)).join(', ')}]`}</TableCell>
                                            <TableCell>{`[[${p.cov[0].map(c => c.toFixed(2)).join(', ')}], [${p.cov[1].map(c => c.toFixed(2)).join(', ')}]]`}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                    {currentEMState && (
                        <TableContainer component={Paper}>
                            <Typography variant="h6" sx={{p: 2}}>Estimated GMM Parameters (Iteration {currentIteration})</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Component</TableCell>
                                        <TableCell>Weight</TableCell>
                                        <TableCell>Mean</TableCell>
                                        <TableCell>Covariance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentEMState.weights.map((w, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell>{w.toFixed(2)}</TableCell>
                                            <TableCell>{`[${currentEMState.means[i].map(m => m.toFixed(2)).join(', ')}]`}</TableCell>
                                            <TableCell>{`[[${currentEMState.covariances[i][0].map(c => c.toFixed(2)).join(', ')}], [${currentEMState.covariances[i][1].map(c => c.toFixed(2)).join(', ')}]]`}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}

export default GMMComponent;