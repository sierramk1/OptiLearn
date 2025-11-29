import * as math from 'mathjs';
import { createInterpolatedFunction } from './utils.js';

const goldenStep = (a, b, c) => {
  const gold = 0.38196; // (3 - sqrt(5)) / 2
  const mid = (a + c) * 0.5;
  if (b > mid) {
    return gold * (a - b);
  } else {
    return gold * (c - b);
  }
};

// Golden-section search implementation based on user's R code
export const goldenSectionSearch = (func, a, b, c, tol = 1e-8, maxIter = 1000) => {
  let a0 = a;
  let b0 = b;
  let c0 = c;
  
  const evaluate = (val) => typeof func === 'string' ? math.evaluate(func, {x: val}) : func(val);

  let fb = evaluate(b0);
  let iter = 0;
  let convergence = 1;
  const steps = [];

  while (iter < maxIter) {
    const step = goldenStep(a0, b0, c0);
    const x = b0 + step;
    const fx = evaluate(x);

    const old_a0 = a0, old_b0 = b0, old_c0 = c0;

    if (fx < fb) {
      if (x > b0) {
        a0 = b0;
      } else {
        c0 = b0;
      }
      b0 = x;
      fb = fx;
    } else {
      if (x < b0) {
        a0 = x;
      } else {
        c0 = x;
      }
    }
    
    steps.push({ a: old_a0, b: old_b0, c: old_c0, x: x, fx: fx, fb: fb, new_a: a0, new_b: b0, new_c: c0 });

    iter++;

    if (Math.abs(c0 - a0) < Math.abs(b0) * tol) {
      convergence = 0;
      break;
    }
  }

  return {
    minimum: b0,
    objective: fb,
    convergence: convergence,
    iter: iter,
    tol: tol,
    steps: steps,
  };
};

export const solveGoldenSearch = (optimizationType, expression, initialGuess, data, tolerance, maxIterations) => {
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
        const { a, b, c } = initialGuess;
        return goldenSectionSearch(expression, a, b, c, tolerance, maxIterations);

    } else if (optimizationType === 'data') {
        if (!data || !initialGuess) {
            throw new Error('Data and initial guess are required for data optimization.');
        }
        const interpolatedFunc = createInterpolatedFunction(data);
        const { a, b, c } = initialGuess;
        return goldenSectionSearch(interpolatedFunc, a, b, c, tolerance, maxIterations);

    } else {
        throw new Error('Invalid optimization type.');
    }
};