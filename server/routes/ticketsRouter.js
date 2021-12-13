const express = require('express');
const router = express.Router();
const authenticateUser = require('../middlewares/authenticateUser');

const {
  createTicket,
  getAllTickets,
  getSingleTicket,
  updateTicket,
  deleteTicket,
} = require('../controllers/ticketController');

router
  .route('/')
  .get(authenticateUser, getAllTickets)
  .post(authenticateUser, createTicket);

router
  .route('/:id')
  .get(authenticateUser, getSingleTicket)
  .patch(authenticateUser, updateTicket)
  .delete(authenticateUser, deleteTicket);

module.exports = router;
