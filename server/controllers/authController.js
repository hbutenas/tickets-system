const pool = require('../database/connectDB');
const { StatusCodes } = require('http-status-codes');
const validator = require('email-validator');
const bcrypt = require('bcryptjs');
const { attachCookiesToResponse } = require('../utils/jwt');
const CustomError = require('../errors');
const crypto = require('crypto');

// TODO: in the very end make registration only available for Owner/Admin
const register = async (req, res) => {
  const { username, email, firstname, lastname, password } = req.body;

  // be sure that we are not missing any of these values on register
  if (!username || !email || !firstname || !lastname || !password) {
    throw new CustomError.BadRequestError('Please provide all required values');
  }

  // check for valid email
  if (!validator.validate(email)) {
    throw new CustomError.BadRequestError('Please provide valid email address');
  }
  // Create verification code which will be sent by email to user
  const verificationCode = Math.random().toString().slice(2, 11);
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const saltedPassword = await bcrypt.hash(password, salt);

  // make sure that all emails are saved as lowercase in db

  const lowercaseEmail = email.toLowerCase();

  // create user array of object
  let userObject = [
    {
      username: username,
      email: lowercaseEmail,
      firstname: firstname,
      lastname: lastname,
      password: saltedPassword,
      verification_code: verificationCode,
    },
  ];

  // count rows in users table
  const countUsers = await pool.count('user_id').from('users');

  // if we have already 1st user keep it as it is
  if (countUsers[0].count > 0) {
    await pool('users').insert(userObject);
  } else {
    userObject[0].role = 'Owner';
    await pool('users').insert(userObject);
  }
  // TODO: NODEMAILER INTEGRATION GOES HERE

  res.status(StatusCodes.CREATED).json({
    user: userObject,
  });
};

const verifyUser = async (req, res) => {
  const { verificationCode } = req.body;

  // be sure that we are not missing verification code before verifying it
  if (!verificationCode) {
    throw new CustomError.BadRequestError('Please provide verification code');
  }

  // find user by his passed code
  let findUserWithMatchingCode = await pool('users').where({
    verification_code: verificationCode,
  });

  // update user, in other scenario throw badrequest error
  if (findUserWithMatchingCode.length > 0) {
    await pool('users')
      .where({ user_id: findUserWithMatchingCode[0].user_id })
      .update({
        user_verified: true,
        verification_code: null,
        verification_date: new Date(),
      });
  } else {
    throw new CustomError.BadRequestError(
      'Please provide valid verification code'
    );
  }

  res.status(StatusCodes.OK).json({ message: 'User successfully verified' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // If passed empty value
  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide all required values');
  }
  // lowercase the email
  const lowercaseEmail = email.toLowerCase();

  // first find user by email in database, then do other validations
  const user = await pool('users').where({ email: lowercaseEmail });

  if (user.length === 0) {
    throw new CustomError.BadRequestError('Invalid email or password');
  }
  // TODO: If i didn't received verification code? Create a functionality to resend it again
  if (!user[0].user_verified) {
    throw new CustomError.BadRequestError(
      'Please verify your account, verification code is sent to provided email address'
    );
  }

  // validate password
  const isPasswordMatching = await bcrypt.compare(password, user[0].password);

  if (!isPasswordMatching) {
    throw new CustomError.BadRequestError('Invalid email or password');
  }

  const payLoad = {
    userId: user[0].user_id,
    username: user[0].username,
  };

  // create refresh token
  let refreshToken = '';

  // check for already existing token
  const findExistingToken = await pool('tokens').where(
    'user_id',
    user[0].user_id
  );

  // if we found a match
  if (findExistingToken.length > 0) {
    // if the current time is more than expire date
    if (findExistingToken[0].expires_at.getTime() < new Date()) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    // the token is still valid assign it
    refreshToken = findExistingToken[0].refresh_token;
    attachCookiesToResponse(res, payLoad, refreshToken);
    res.status(StatusCodes.OK).json({ refresh_token: refreshToken });
    return;
  }

  // if user didn't had a token
  const tokenObject = {
    user_id: user[0].user_id,
    refresh_token: crypto.randomBytes(40).toString('hex'),
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 3600 * 1000 * 24).toISOString(),
  };

  await pool('tokens').insert(tokenObject);

  attachCookiesToResponse(res, payLoad, tokenObject.refresh_token);

  res.status(StatusCodes.OK).json({ refresh_token: refreshToken });
};

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(),
  });
  res.status(StatusCodes.OK).json({ msg: 'User logged out!' });
};

module.exports = {
  register,
  verifyUser,
  login,
  logout,
};
