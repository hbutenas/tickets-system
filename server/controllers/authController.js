const pool = require('../database/connectDB');
const { StatusCodes } = require('http-status-codes');
const validator = require('email-validator');
const bcrypt = require('bcryptjs');
const { attachCookiesToResponse } = require('../utils/jwt');
const CustomError = require('../errors');

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

  // count rows in users table, if it's the first user make him owner
  const countUserTableRows = await pool.query('SELECT FROM users');

  countUserTableRows.rowCount === 0
    ? (createNewUser = await pool.query(
        'INSERT INTO users (username, email, firstname, lastname, password, verification_code, role) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
        [
          username,
          email,
          firstname,
          lastname,
          saltedPassword,
          verificationCode,
          'Owner',
        ]
      ))
    : (createNewUser = await pool.query(
        'INSERT INTO users (username, email, firstname, lastname, password, verification_code) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
        [username, email, firstname, lastname, saltedPassword, verificationCode]
      ));
  /**
   * TODO: NODEMAILER INTEGRATION GOES HERE
   */

  res.status(StatusCodes.CREATED).json({
    user: createNewUser.rows[0],
  });
};

const verifyUser = async (req, res) => {
  const { verificationCode } = req.body;

  if (!verificationCode) {
    throw new CustomError.BadRequestError('Please provide verification code');
  }

  const findUserWithMatchingCode = await pool.query(
    'SELECT * FROM users WHERE verification_code  = $1',
    [verificationCode]
  );

  // If passed invalid value
  if (findUserWithMatchingCode.rows.length === 0) {
    throw new CustomError.BadRequestError(
      'Please provide valid verification code'
    );
  }

  // Update user if find existing one
  await pool.query(
    'UPDATE users SET verification_code = $1, user_verified = $2, verification_date = $3 WHERE user_id = $4',
    [null, true, new Date(), findUserWithMatchingCode.rows[0].user_id]
  );

  res.status(StatusCodes.OK).json({ message: 'User successfully verified' });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // If passed empty value
  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide all required values');
  }

  const user = await pool.query('SELECT * FROM users WHERE email = $1', [
    email,
  ]);

  // If couldn't find any user with provided email
  if (user.rows.length === 0) {
    throw new CustomError.BadRequestError('Invalid email or password');
  }

  // Is account activated?
  // Keep the same message for security purposes
  if (!user.rows[0].user_verified) {
    throw new CustomError.BadRequestError(
      'Please verify your account, verification code is sent to provided email address'
    );
  }

  const isPasswordMatching = await bcrypt.compare(
    password,
    user.rows[0].password
  );

  if (!isPasswordMatching) {
    throw new CustomError.BadRequestError('Invalid email or password');
  }

  const payLoad = {
    userId: user.rows[0].user_id,
    username: user.rows[0].username,
    email: user.rows[0].email,
    role: user.rows[0].role,
  };
  attachCookiesToResponse(res, payLoad);
  res.status(StatusCodes.OK).json({ user: payLoad });
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
