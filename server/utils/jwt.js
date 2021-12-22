const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const pool = require('../database/connectDB');

const attachCookiesToResponse = (res, user, refreshToken) => {
  const expTimeFifteenMins = 1000 * 60 * 15 * 9; // 15mins

  res.cookie('access_token', jwt.sign(user, process.env.JWT_SECRET), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    // secure: true,
    maxAge: expTimeFifteenMins,
  });

  const expTimeOneDay = 1000 * 60 * 60 * 24;

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    // secure: true,
    maxAge: expTimeOneDay,
  });
};

const isTokenValid = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = { attachCookiesToResponse, isTokenValid };
