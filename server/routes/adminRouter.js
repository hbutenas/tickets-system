const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/authenticateUser');
const authorizePermissions = require('../middlewares/authorizePermissions');
const {
  updateUserRole,
  getAllTickets,
  changeTicketStatus,
} = require('../controllers/adminController');

router.patch(
  '/update/user/:id',
  [authenticateUser, authorizePermissions('Owner')],
  updateUserRole
);
router.patch(
  '/update/ticket/:id',
  [authenticateUser, authorizePermissions('Owner', 'Admin', 'IT')],
  changeTicketStatus
);

router.get(
  '/tickets',
  [authenticateUser, authorizePermissions('Owner', 'Admin', 'IT')],
  getAllTickets
);

module.exports = router;
