/**
 * Middleware to catch async errors in route handlers
 * Eliminates need for try-catch blocks
 */
export const catchAsyncErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Default export
export default catchAsyncErrors;
