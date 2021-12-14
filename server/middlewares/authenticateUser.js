const { isTokenValid } = require('../utils/jwt');
const CustomError = require('../errors');

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
  try {
    const { userId, username, email, role } = isTokenValid(token);

    req.user = { userId, username, email, role };

    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication invalid');
  }
};

module.exports = authenticateUser;
