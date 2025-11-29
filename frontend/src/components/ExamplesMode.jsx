import React from 'react';
import LinearRegressionExample from './Examples/LinearRegressionExample.jsx';

function ExamplesMode() {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, minHeight: 0, padding: '0 20px 20px 20px' }}>
        <LinearRegressionExample />
      </div>
    </div>
  );
}

export default ExamplesMode;
