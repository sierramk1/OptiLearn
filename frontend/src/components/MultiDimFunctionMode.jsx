import React, { useState } from 'react';
import { Select, MenuItem, FormControl } from '@mui/material';
import GradientDescentComponent from './MultiDimAlgos/GradientDescentComponent.jsx';
import NewtonsMethodComponent from './MultiDimAlgos/NewtonsMethodComponent.jsx';

function MultiDimFunctionMode() {
  const [selectedAlgo, setSelectedAlgo] = useState('gradientDescent');

  const handleSelectChange = (event) => {
    setSelectedAlgo(event.target.value);
  };

  const renderSelectedAlgo = () => {
    switch (selectedAlgo) {
      case 'gradientDescent':
        return <GradientDescentComponent />;
      case 'newtonsMethod':
        return <NewtonsMethodComponent />;
      default:
        return null;
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px', padding: '10px 20px 0 20px', display: 'flex', alignItems: 'center' }}>
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
            <MenuItem value="gradientDescent">Gradient Descent</MenuItem>
            <MenuItem value="newtonsMethod">Newton's Method</MenuItem>
          </Select>
        </FormControl>
      </div>

      <div style={{ flex: 1, minHeight: 0, padding: '0 20px 20px 20px' }}>
        {renderSelectedAlgo()}
      </div>
    </div>
  );
}

export default MultiDimFunctionMode;
