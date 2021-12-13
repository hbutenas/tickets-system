const pool = require('../database/connectDB');
const { StatusCodes } = require('http-status-codes');
const validator = require('email-validator');
const bcrypt = require('bcryptjs');
const attachCookiesToResponse = require('../utils/jwt');

const register = async (req, res) => {
  const { username, email, firstname, lastname, password } = req.body;
  try {
    // If any of these values are missing from body, throw bad request
    if (!username || !email || !firstname || !lastname || !password) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Please provide all values' });
    }
    // If it's not an email, throw bad request
    if (!validator.validate(email)) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Provide valid email address' });
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
          [
            username,
            email,
            firstname,
            lastname,
            saltedPassword,
            verificationCode,
          ]
        ));
    /**
     * TODO: NODEMAILER INTEGRATION GOES HERE
     */

    res.status(StatusCodes.CREATED).json({
      user: createNewUser.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Email address is already taken' });
    }
  }
};

const verifyUser = async (req, res) => {
  const { verificationCode } = req.body;
  try {
    // If passed empty value
    if (!verificationCode) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Please provide valid verification code' });
    }
    const findUserWithMatchingCode = await pool.query(
      'SELECT * FROM users WHERE verification_code  = $1',
      [verificationCode]
    );
    // If passed invalid value
    if (findUserWithMatchingCode.rows.length === 0) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Please provide valid verification code' });
    }

    // Update user if find existing one
    await pool.query(
      'UPDATE users SET verification_code = $1, user_verified = $2, verification_date = $3 WHERE user_id = $4',
      [null, true, new Date(), findUserWithMatchingCode.rows[0].user_id]
    );
    res.status(StatusCodes.OK).json({ message: 'User successfully verified' });
  } catch (error) {
    console.error(error.message);
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // If passed empty value
    if (!username || !password) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Please provide username and password' });
    }

    const user = await pool.query('SELECT * FROM users WHERE username = $1', [
      username,
    ]);

    // If couldn't find any user with provided username
    if (user.rows.length === 0) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Invalid username or password' });
    }
    // Is account activated?
    // Keep the same message for security purposes
    if (!user.rows[0].user_verified) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Invalid username or password' });
    }

    const isPasswordMatching = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!isPasswordMatching) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Invalid username or password' });
    }

    const payLoad = {
      userId: user.rows[0].user_id,
      username: user.rows[0].username,
      email: user.rows[0].email,
      role: user.rows[0].role,
    };
    attachCookiesToResponse(res, payLoad);
    res.status(StatusCodes.OK).json({ user: payLoad });
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = {
  register,
  verifyUser,
  login,
};
