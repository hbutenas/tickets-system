const { StatusCodes } = require('http-status-codes');
const errorHandler = async (err, req, res, next) => {
  console.log(err);
  // set default
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong try again later',
  };

  // duplicate value
  if (err.code === '23505') {
    customError.msg = `Duplicate value entered for ${err.constraint}`;
    customError.statusCode = 400;
  }

  return res.status(customError.statusCode).json({ message: customError.msg });
};

module.exports = errorHandler;
