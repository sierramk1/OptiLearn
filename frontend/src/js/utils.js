import Spline from 'cubic-spline';

const piecewiseLinearInterpolation = (xs, ys) => {
  return (x) => {
    // If x is outside the overall data range, return NaN
    if (x < xs[0] || x > xs[xs.length - 1]) {
      return NaN;
    }

    // If x is exactly the first data point
    if (x === xs[0]) {
        return ys[0];
    }
    // If x is exactly the last data point
    if (x === xs[xs.length - 1]) {
        return ys[ys.length - 1];
    }

    // Find the interval for interpolation
    // Find the index 'i' such that xs[i-1] < x <= xs[i]
    let i = xs.findIndex(xi => xi >= x);

    // This 'i' should now always be > 0 and < xs.length
    // because we've handled the boundary conditions and out-of-range cases.
    
    const x1 = xs[i - 1], y1 = ys[i - 1];
    const x2 = xs[i], y2 = ys[i];
    
    if (x2 === x1) return y1; // Handle duplicate x-values

    return y1 + (y2 - y1) * (x - x1) / (x2 - x1); // Interpolate
  };
};

export const createInterpolatedFunction = (data, type = 'cubic') => {
    // Sort the data by x-values first to ensure correct interpolation
    const sortedData = [...data].sort((a, b) => a.x - b.x);

    const xs = sortedData.map(p => p.x);
    const ys = sortedData.map(p => p.y);

    if (type === 'cubic') {
        const spline = new Spline(xs, ys);
        const minX = xs[0];
        const maxX = xs[xs.length - 1];
        return (x) => {
            if (x < minX || x > maxX) {
                // console.log(`Cubic: x=${x} is outside [${minX}, ${maxX}], returning NaN`);
                return NaN; // Prevent extrapolation
            }

            // Check if x is exactly one of the data points
            const index = xs.indexOf(x);
            if (index !== -1) {
                // console.log(`Cubic: x=${x} is a data point, returning ys[${index}]=${ys[index]}`);
                return ys[index];
            }

            const result = spline.at(x);
            return result;
        };
    } else if (type === 'piecewise') {
        return piecewiseLinearInterpolation(xs, ys);
    } else {
        throw new Error(`Unknown interpolation type: ${type}`);
    }
};
