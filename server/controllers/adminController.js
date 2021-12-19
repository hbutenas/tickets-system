const pool = require('../database/connectDB');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

/*
Update user role ( only owner)

*/

const updateUserRole = async (req, res) => {
  const { id: userId } = req.params;
  const { role } = req.body;

  if (!role || role === 'Owner') {
    throw new CustomError.BadRequestError('Please provide valid values');
  }

  await pool('users').where({ user_id: userId }).update('role', role);

  res.status(StatusCodes.OK).json({ message: 'Status successfully updated' });
};

const getAllTickets = async (req, res) => {
  const tickets = await pool('tickets');

  res.status(StatusCodes.OK).json(tickets);
};

const changeTicketStatus = async (req, res) => {
  const { id: ticketId } = req.params;
  const { status } = req.body;

  if (!ticketId) {
    throw new CustomError.BadRequestError(`Please provide ticket id`);
  }

  if (!status) {
    throw new CustomError.BadRequestError('Please provide status value');
  }

  const ticket = await pool('tickets').where('ticket_id', ticketId);

  if (ticket.length === 0) {
    throw new CustomError.NotFoundError(
      `Ticket with id ${ticketId} does not exists.`
    );
  }
  if (status === 'In progress' || status === 'Done') {
    await pool('tickets').where('ticket_id', ticketId).update('status', status);

    res.status(StatusCodes.OK).json({ message: 'Ticket status updated' });
  } else {
    throw new CustomError.BadRequestError('Please provide status value');
  }
};

module.exports = {
  updateUserRole,
  getAllTickets,
  changeTicketStatus,
};
