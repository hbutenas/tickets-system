const { StatusCodes } = require('http-status-codes');

const checkPermissions = (res, requestUser, resourceUserId) => {
  if (requestUser.userId === resourceUserId) return;
  if (requestUser.role === 'Owner' || requestUser.role === 'Admin') return;
  res
    .status(StatusCodes.UNAUTHORIZED)
    .json({ message: 'You are not authorized to access this route' });
};

module.exports = checkPermissions;
