import Spline from 'cubic-spline';

const piecewiseLinearInterpolation = (xs, ys) => {
  return (x) => {
    let i = xs.findIndex(xi => xi >= x);

    if (i === -1) { // x is greater than all xs
        if (xs.length < 2) return ys[ys.length - 1];
        const x1 = xs[xs.length - 2], y1 = ys[ys.length - 2];
        const x2 = xs[xs.length - 1], y2 = ys[ys.length - 1];
        if (x2 === x1) return y2;
        return y1 + (y2 - y1) * (x - x1) / (x2 - x1); // Extrapolate
    }
    if (i === 0) { // x is smaller than all xs
        if (xs.length < 2) return ys[0];
        const x1 = xs[0], y1 = ys[0];
        const x2 = xs[1], y2 = ys[1];
        if (x2 === x1) return y2;
        return y1 + (y2 - y1) * (x - x1) / (x2 - x1); // Extrapolate
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
        return (x) => spline.at(x);
    } else if (type === 'piecewise') {
        return piecewiseLinearInterpolation(xs, ys);
    } else {
        throw new Error(`Unknown interpolation type: ${type}`);
    }
};
