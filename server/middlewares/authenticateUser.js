const { isTokenValid } = require('../utils/jwt');
const { StatusCodes } = require('http-status-codes');
const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Authentication invalid' });
  }
  try {
    const { userId, username, email, role } = isTokenValid(token);

    req.user = { userId, username, email, role };

    next();
  } catch (error) {
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: 'Authentication invalid' });
  }
};

module.exports = authenticateUser;
