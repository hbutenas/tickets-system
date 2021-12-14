const { StatusCodes } = require('http-status-codes');
const errorHandler = async (err, req, res, next) => {
  // set default
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later',
  };

  return res.status(customError.statusCode).json({ message: customError.msg });
};

module.exports = errorHandler;
