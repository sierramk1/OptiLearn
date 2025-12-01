import { create, all } from 'mathjs';

const math = create(all);

// Ensure cholesky is enabled (it is under math.lusolve / math.cov dependencies)
if (!math.cholesky) {
  console.error("⚠️ math.cholesky not available — mathjs version may be incomplete");
}

export default math;
