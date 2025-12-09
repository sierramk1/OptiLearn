import * as math from 'mathjs';
import { createInterpolatedFunction } from './utils.js'; // Import from the new frontend utils.js

// Bisection method implementation
export const bisection = (func, a, b, tol = 1e-5, maxIter = 100) => {
    const steps = [];
    let c;

    const fa_initial = typeof func === 'string' ? math.evaluate(func, {x: a}) : func(a);
    if (math.abs(fa_initial) < tol) {
        steps.push({ a, b, c: a });
        return steps;
    }

    const fb_initial = typeof func === 'string' ? math.evaluate(func, {x: b}) : func(b);
    if (math.abs(fb_initial) < tol) {
        steps.push({ a, b, c: b });
        return steps;
    }

    // Check if f(a) and f(b) have opposite signs
    if (fa_initial * fb_initial >= 0) {
        throw new Error("Function values at 'a' and 'b' must have opposite signs (f(a) * f(b) < 0).");
    }

    for (let i = 0; i < maxIter; i++) {
        c = (a + b) / 2;
        steps.push({ a, b, c });
        if (b - a < tol) {
            return steps;
        }
        // The func can be a string expression or a direct function
        const fa = typeof func === 'string' ? math.evaluate(func, {x: a}) : func(a);
        const fc = typeof func === 'string' ? math.evaluate(func, {x: c}) : func(c);

        if (fa * fc < 0) {
            b = c;
        } else {
            a = c;
        }
    }
    return steps;
};

// This function will be called from the React component (e.g., BisectionComponent.jsx)
// It encapsulates the logic for handling 'function' and 'data' optimization types
export const solveBisection = (optimizationType, expression, initialGuess, data, tolerance, maxIterations, interpolationType = 'cubic') => {
    if (tolerance < 0) {
        throw new Error('Tolerance cannot be negative.');
    }
    if (maxIterations < 0) {
        throw new Error('Max iterations cannot be negative.');
    }
    if (optimizationType === 'function') {
        if (!expression || !initialGuess) {
            throw new Error('Expression and initial guess are required for function optimization.');
        }
        const { a, b } = initialGuess;
        return bisection(expression, a, b, tolerance, maxIterations);

    } else if (optimizationType === 'data') {
        if (!data || !initialGuess) {
            throw new Error('Data and initial guess are required for data optimization.');
        }
        const interpolatedFunc = createInterpolatedFunction(data, interpolationType);
        const { a, b } = initialGuess;
        return bisection(interpolatedFunc, a, b, tolerance, maxIterations);

    } else {
        throw new Error('Invalid optimization type.');
    }
};
