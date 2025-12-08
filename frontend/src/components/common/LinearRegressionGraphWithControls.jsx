import React from 'react';
import { Slider, Box, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import ReplayIcon from '@mui/icons-material/Replay';
import Plot from 'react-plotly.js';

function LinearRegressionGraphWithControls({
  plotData,
  layout,
  animationSteps,
  currentStepIndex,
  isPlaying,
  onPlayPause,
  onPrevStep,
  onNextStep,
  onReset,
  onSliderChange,
}) {
  const buttonSx = {
    backgroundColor: '#72A8C8',
    fontSize: '0.8em',
    padding: '4px 12px',
    '&:hover': {
      backgroundColor: '#5a8fa8',
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <Plot
          data={plotData}
          layout={layout}
          useResizeHandler={true}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
      {animationSteps.length > 0 && (
        <Box sx={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <Button onClick={onPrevStep} disabled={currentStepIndex === 0} size="small" variant="contained" sx={buttonSx}>
            <SkipPreviousIcon />
          </Button>
          <Button onClick={onPlayPause} size="small" variant="contained" sx={buttonSx}>
            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
          </Button>
          <Button onClick={onNextStep} disabled={currentStepIndex === animationSteps.length - 1} size="small" variant="contained" sx={buttonSx}>
            <SkipNextIcon />
          </Button>
          <Button onClick={onReset} size="small" variant="contained" sx={buttonSx}>
            <ReplayIcon />
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default LinearRegressionGraphWithControls;