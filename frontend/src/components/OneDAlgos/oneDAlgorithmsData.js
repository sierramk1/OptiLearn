const oneDAlgorithms = [
  {
    name: "Bisection Method",
    description: "A root-finding algorithm that starts with two points where the function has opposite signs, guaranteeing a root between them.",
    type: "Root-finding method",
    route: "/one-dimensional/bisection",
  },
  {
    name: "Golden Search Method",
    description: "A technique for finding the extremum of a strictly unimodal function by successively narrowing the range of values inside which the extremum is known to exist.",
    type: "Optimization method",
    route: "/one-dimensional/golden-search",
  },
  {
    name: "Newton-Raphson Method",
    description: "An open method for finding successively better approximations to the roots (or zeroes) of a real-valued function.",
    type: "Root-finding method",
    route: "/one-dimensional/newton-raphson",
  },
  {
    name: "Secant Method",
    description: "A root-finding algorithm that uses a succession of roots of secant lines to better approximate a root of a function.",
    type: "Root-finding method",
    route: "/one-dimensional/secant",
  },
];

export default oneDAlgorithms;
