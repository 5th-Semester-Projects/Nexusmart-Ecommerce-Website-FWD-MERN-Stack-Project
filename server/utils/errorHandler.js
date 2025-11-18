/**
 * Custom Error Handler class
 * Extends built-in Error class with status code
 */
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorHandler;
