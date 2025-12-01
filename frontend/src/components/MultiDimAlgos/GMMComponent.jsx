import React, { useState, useEffect, useRef } from 'react';
import { Button, Box, Typography, Paper, Grid, Slider, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Plot from 'react-plotly.js';
import { generateGMMData } from '../../js/data_generators.js';
import { runEM } from '../../js/gmm_mle.js';
import math from '../../js/math_config.js';
import { eigenDecomposition2x2 } from '../../js/math_linear_algebra.js';

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

    useEffect(() => {
        if (isPlaying && currentIteration < emHistory.length - 1) {
            intervalRef.current = setInterval(() => {
                setCurrentIteration(prev => prev + 1);
            }, 500);
        } else {
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
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Controls</Typography>
                        <Box sx={{ mt: 2 }}>
                            <Typography>Number of Samples: {nSamples}</Typography>
                            <Slider value={nSamples} onChange={(e, v) => setNSamples(v)} min={200} max={1000} step={10} />
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Typography>Number of Components: {nComponents}</Typography>
                            <Slider value={nComponents} onChange={(e, v) => setNComponents(v)} min={2} max={5} step={1} />
                        </Box>

                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                            <Button variant="contained" onClick={handleGenerateData}>Generate Data</Button>
                            <Button variant="contained" onClick={handleRunEM} color="secondary">Run EM</Button>
                        </Box>
                    </Paper>
                    {emHistory.length > 0 && (
                        <Paper sx={{ p: 2, mt: 2 }}>
                            <Typography variant="h6">Animation</Typography>
                            <Typography>Iteration: {currentIteration} / {emHistory.length - 1}</Typography>
                            <Slider value={currentIteration} onChange={(e, v) => setCurrentIteration(v)} min={0} max={emHistory.length - 1} step={1} />
                            <Button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? 'Pause' : 'Play'}</Button>
                        </Paper>
                    )}
                </Grid>
                <Grid item xs={12} md={8}>
                    <Plot
                        data={clusterPlotData}
                        layout={{
                            title: 'GMM Clusters',
                            xaxis: { title: 'x1' },
                            yaxis: { title: 'x2' },
                            shapes: ellipseShapes,
                            showlegend: false
                        }}
                        style={{ width: '100%', height: '400px' }}
                    />
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
                </Grid>
            </Grid>
            
            {emHistory.length > 0 && (
                <Box sx={{mt: 2}}>
                    <Typography>Final log-likelihood: {emHistory[emHistory.length-1].logLikelihood.toFixed(4)}</Typography>
                    <Typography>Number of EM iterations: {emHistory.length - 1}</Typography>
                    <Typography>Converged? {converged.toString()}</Typography>
                </Box>
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