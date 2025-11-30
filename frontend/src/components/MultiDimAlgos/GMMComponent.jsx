import React, { useState, useEffect, useRef } from 'react';
import { Button, Box, Typography, Paper, Grid, Slider, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Plot from 'react-plotly.js';
import { generateGMMData } from '../../js/data_generators.js';
import { runEM } from '../../js/gmm_mle.js';
import math from '../../js/math_config.js';

function GMMComponent() {
    // UI Controls State
    const [nSamples, setNSamples] = useState(400);
    const [nComponents, setNComponents] = useState(3);
    const [randomSeed, setRandomSeed] = useState(42);

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
            // DEBUG: Use dummy data to isolate the problem
            const dummyData = [[1, 2], [1.5, 2.5], [2, 3], [8, 9], [8.5, 9.5], [9, 10]];
            const dummyParams = [
                { weight: 0.5, mean: [1.5, 2.5], cov: [[1, 0], [0, 1]] },
                { weight: 0.5, mean: [8.5, 9.5], cov: [[1, 0], [0, 1]] }
            ];
            setData(dummyData);
            setTrueParams(dummyParams);
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
            const { history, converged: emConverged } = runEM(data, nComponents);
            setEmHistory(history);
            setConverged(emConverged);
            setCurrentIteration(0);
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


    const getEllipse = (mean, cov, n_std_dev = 2) => {
        const eig = math.eigs(cov);
        const eigenvalues = eig.values;
        const eigenvectors = eig.eigenvectors;
        
        const angle = Math.atan2(eigenvectors[1][0], eigenvectors[0][0]);
        const a = n_std_dev * Math.sqrt(eigenvalues[0]);
        const b = n_std_dev * Math.sqrt(eigenvalues[1]);

        const N = 100;
        const t = Array.from({length: N}, (_, i) => (i / (N - 1)) * 2 * Math.PI);
        const x = t.map(val => a * Math.cos(val));
        const y = t.map(val => b * Math.sin(val));

        const rotatedX = x.map((val, i) => mean[0] + val * Math.cos(angle) - y[i] * Math.sin(angle));
        const rotatedY = y.map((val, i) => mean[1] + val * Math.sin(angle) + y[i] * Math.cos(angle));

        return {x: rotatedX, y: rotatedY};
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
            ellipseShapes.push({
                type: 'path',
                path: `M ${ellipse.x.map((v, j) => `${v},${ellipse.y[j]}`).join(' L ')} Z`,
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
                        <Box sx={{ mt: 2 }}>
                            <TextField label="Random Seed" type="number" value={randomSeed} onChange={(e) => setRandomSeed(parseInt(e.target.value))} fullWidth />
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