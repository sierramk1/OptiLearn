// --- Cholesky Decomposition for 2×2 or larger matrices ---
export function choleskyDecomposition(A) {
  const n = A.length;
  const L = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;
      for (let k = 0; k < j; k++) {
        sum += L[i][k] * L[j][k];
      }

      if (i === j) {
        const value = A[i][i] - sum;
        if (value <= 0) throw new Error("Covariance is not positive definite");
        L[i][j] = Math.sqrt(value);
      } else {
        L[i][j] = (A[i][j] - sum) / L[j][j];
      }
    }
  }

  return L;
}

// --- Eigenvalues & Eigenvectors for 2×2 covariance matrices ---
export function eigenDecomposition2x2(A) {
  const a = A[0][0], b = A[0][1];
  const c = A[1][0], d = A[1][1];

  const trace = a + d;
  const det = a*d - b*c;
  const term = Math.sqrt(Math.max(trace*trace - 4*det, 0)); // avoid negatives from rounding

  const λ1 = (trace + term) / 2;
  const λ2 = (trace - term) / 2;

  // Eigenvector for λ1
  let v1 = [b, λ1 - a];
  if (Math.abs(v1[0]) < 1e-8 && Math.abs(v1[1]) < 1e-8) v1 = [1, 0];
  const norm1 = Math.hypot(v1[0], v1[1]);
  v1 = [v1[0] / norm1, v1[1] / norm1];

  // Eigenvector for λ2
  let v2 = [b, λ2 - a];
  if (Math.abs(v2[0]) < 1e-8 && Math.abs(v2[1]) < 1e-8) v2 = [0, 1];
  const norm2 = Math.hypot(v2[0], v2[1]);
  v2 = [v2[0] / norm2, v2[1] / norm2];

  return {
    values: [λ1, λ2],
    vectors: [v1, v2]
  };
}
