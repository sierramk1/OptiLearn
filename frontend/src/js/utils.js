import Spline from 'cubic-spline';

const piecewiseLinearInterpolation = (xs, ys) => {
  return (x) => {
    let i = xs.findIndex(xi => xi >= x);

    if (i === -1) { // x is greater than all xs
        return NaN;
    }
    if (i === 0) { // x is smaller than all xs
        return NaN;
    }

    const x1 = xs[i - 1], y1 = ys[i - 1];
    const x2 = xs[i], y2 = ys[i];
    
    if (x2 === x1) return y1;

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
                return NaN; // Prevent extrapolation
            }
            return spline.at(x);
        };
    } else if (type === 'piecewise') {
        return piecewiseLinearInterpolation(xs, ys);
    } else {
        throw new Error(`Unknown interpolation type: ${type}`);
    }
};
