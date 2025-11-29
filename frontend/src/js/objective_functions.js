// objective_functions.js

import * as math from 'mathjs';

/**
 * Least Squares Objective Function
 * J(b) = (1 / 2n) * ||Xb - y||^2
 * @param {math.Matrix} X - Design matrix
 * @param {math.Matrix} y - Target vector
 * @returns {function(math.Matrix): number} - The objective function
 */
export function leastSquaresObjective(X, y) {
  const n = X.size()[0];
  return function(b) {
    const error = math.subtract(math.multiply(X, b), y);
    return (1 / (2 * n)) * math.multiply(math.transpose(error), error);
  };
}

/**
 * Gradient of Least Squares Objective Function
 * grad J(b) = (1 / n) * X^T * (Xb - y)
 * @param {math.Matrix} X - Design matrix
 * @param {math.Matrix} y - Target vector
 * @returns {function(math.Matrix): math.Matrix} - The gradient function
 */
export function leastSquaresGradient(X, y) {
  const n = X.size()[0];
  const Xt = math.transpose(X);
  return function(b) {
    const error = math.subtract(math.multiply(X, b), y);
    return math.multiply(Xt, error).map(val => val / n);
  };
}

/**
 * Hessian of Least Squares Objective Function
 * H(b) = (1 / n) * X^T * X
 * @param {math.Matrix} X - Design matrix
 * @returns {math.Matrix} - The Hessian matrix
 */
export function leastSquaresHessian(X) {
  const n = X.size()[0];
  const Xt = math.transpose(X);
  return math.multiply(Xt, X).map(val => val / n);
}
