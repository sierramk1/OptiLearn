import React, { useState } from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import MultiDimFunctionMode from './MultiDimFunctionMode.jsx';
import ExamplesMode from './ExamplesMode.jsx';

function MultiDimAlgorithmViewer() {
  const [mode, setMode] = useState('function');

  const handleModeChange = (event, newMode) => {
    if (newMode !== null) {
      setMode(newMode);
    }
  };

  return (
    <div style={{ marginTop: '0px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px 20px 0 20px', display: 'flex', justifyContent: 'flex-end' }}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={handleModeChange}
          aria-label="optimization mode"
        >
          <ToggleButton value="function" aria-label="function mode">
            Function
          </ToggleButton>
          <ToggleButton value="examples" aria-label="examples mode">
            Example
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        {mode === 'function' ? <MultiDimFunctionMode /> : <ExamplesMode />}
      </div>
    </div>
  );
}

export default MultiDimAlgorithmViewer;
