import React, { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import LinearRegressionExample from './Examples/LinearRegressionExample.jsx';
import GMMComponent from './MultiDimAlgos/GMMComponent.jsx';

function ExamplesMode() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="examples tabs">
          <Tab label="Linear Regression" />
          <Tab label="GMM Clustering" />
        </Tabs>
      </Box>
      <div style={{ flex: 1, minHeight: 0, padding: '20px' }}>
        {selectedTab === 0 && <LinearRegressionExample />}
        {selectedTab === 1 && <GMMComponent />}
      </div>
    </div>
  );
}

export default ExamplesMode;
