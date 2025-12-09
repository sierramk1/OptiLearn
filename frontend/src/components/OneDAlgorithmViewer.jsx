
import React, { useState } from 'react';
import { Select, MenuItem, FormControl, ToggleButtonGroup, ToggleButton, Button, Typography, Box } from '@mui/material';
import BisectionComponent from './OneDAlgos/BisectionComponent.jsx';
import GoldenSearchComponent from './OneDAlgos/GoldenSearchComponent.jsx';
import NewtonRaphsonComponent from './OneDAlgos/NewtonRaphsonComponent.jsx';
import SecantComponent from './OneDAlgos/SecantComponent.jsx';

function OneDAlgorithmDisplay() {
  const [selectedAlgo, setSelectedAlgo] = useState('bisection');
  const [optimizationType, setOptimizationType] = useState('function');
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);

  const handleSelectChange = (event) => {
    setSelectedAlgo(event.target.value);
  };

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
            // Only process rows that are not empty and do not start with 'x,y' (header)
            // and appear to start with a number (first character is a digit or a minus sign)
            return trimmedRow !== '' && 
                   !trimmedRow.startsWith('x,y') &&
                   (trimmedRow.charAt(0) === '-' || (trimmedRow.charAt(0) >= '0' && trimmedRow.charAt(0) <= '9'));
          })
          .map(row => {
            const parts = row.split(',').map(Number);
            // Ensure we have at least two numeric parts
            if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
              return { x: parts[0], y: parts[1] };
            }
            return null; // Invalid row
          })
          .filter(p => p !== null); // Remove invalid rows
        setData(parsedData);
      };
      reader.readAsText(file);
    }
  };

  const renderSelectedAlgo = () => {
    const props = { optimizationType, data };
    switch (selectedAlgo) {
      case 'bisection':
        return <BisectionComponent {...props} />;
      case 'goldenSearch':
        return <GoldenSearchComponent {...props} />;
      case 'newtonRaphson':
        return <NewtonRaphsonComponent {...props} />;
      case 'secant':
        return <SecantComponent {...props} />;
      default:
        return null;
    }
  }

  return (
    <div style={{ marginTop: '0px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px', padding: '10px 20px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <FormControl sx={{ minWidth: 300 }}>
          <Select
            value={selectedAlgo}
            onChange={handleSelectChange}
            displayEmpty
            sx={{
              fontSize: '1.5em',
              color: 'inherit',
              fontWeight: 'bold',
              borderRadius: '50px',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '& .MuiSelect-select': {
                backgroundColor: '#72A8C8',
                color: 'white',
                borderRadius: '50px',
                padding: '8px 32px 8px 20px',
                '&:hover': {
                  backgroundColor: '#5A86A4',
                },
              },
            }}
          >
            <MenuItem value="bisection">Bisection Method</MenuItem>
            <MenuItem value="goldenSearch">Golden Search Method</MenuItem>
            <MenuItem value="newtonRaphson">Newton-Raphson Method</MenuItem>
            <MenuItem value="secant">Secant Method</MenuItem>
          </Select>
        </FormControl>
        <ToggleButtonGroup
          value={optimizationType}
          exclusive
          onChange={handleOptimizationTypeChange}
          aria-label="optimization type"
        >
          <ToggleButton value="function" aria-label="function optimization">
            Function
          </ToggleButton>
          <ToggleButton value="data" aria-label="data optimization">
            Data
          </ToggleButton>
        </ToggleButtonGroup>
      </div>

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

      <div style={{ flex: 1, minHeight: 0, padding: '0 20px 20px 20px' }}>
        {renderSelectedAlgo()}
      </div>
    </div>
  );
}

export default OneDAlgorithmDisplay;

