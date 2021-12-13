const express = require('express');
const router = express.Router();
const {
  register,
  verifyUser,
  login,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/verify', verifyUser);
router.post('/login', login);

module.exports = router;
