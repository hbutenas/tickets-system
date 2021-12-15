const { StatusCodes } = require('http-status-codes');
const CustomError = require('./CustomError');

class BadRequestError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = BadRequestError;
