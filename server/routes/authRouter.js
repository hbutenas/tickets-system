const express = require('express');
const router = express.Router();
const {
  register,
  verifyUser,
  login,
  logout,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/verify', verifyUser);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;
