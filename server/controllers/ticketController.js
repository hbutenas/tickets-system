const { StatusCodes } = require('http-status-codes');
const pool = require('../database/connectDB');
const checkPermissions = require('../utils/checkPermissions');
const CustomError = require('../errors');

const createTicket = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new CustomError.BadRequestError('Please provide all required values');
  }

  let ticketObject = [
    {
      title,
      description,
      user_id: req.user.userId,
    },
  ];

  const ticket = await pool('tickets').insert(ticketObject).returning('*');

  res.status(StatusCodes.CREATED).json({ ticket });
};

const getAllTickets = async (req, res) => {
  const tickets = await pool('tickets');

  if (tickets.length === 0) {
    throw new CustomError.NotFoundError(`Currently we don't have any tickets`);
  }

  res.status(StatusCodes.OK).json({ tickets });
};

const getSingleTicket = async (req, res) => {
  const { id: ticketId } = req.params;
  // find a ticket by ticket id
  const ticket = await pool('tickets').where({ ticket_id: ticketId });

  if (ticket.length === 0) {
    throw new CustomError.NotFoundError(
      `Ticket with id ${ticketId} does not exists`
    );
  }

  res.status(StatusCodes.OK).json({ ticket });
};

const updateTicket = async (req, res) => {
  const { id: ticketId } = req.params;
  const { title, description } = req.body;

  // find a ticket by ticket id
  const ticket = await pool('tickets').where({ ticket_id: ticketId });

  if (ticket.length === 0) {
    throw new CustomError.NotFoundError(
      `Ticket with id ${ticketId} does not exists`
    );
  }
  // allow only to update tickets only for people who created it or for owner/admin/it_support roles.
  checkPermissions(res, req.user, ticket[0].user_id);

  // if title or description is passed empty, use the old values from the ticket
  let updateTicketObject = {
    title: title || ticket[0].title,
    description: description || ticket[0].description,
  };

  const updatedTicket = await pool('tickets')
    .where({ ticket_id: ticketId })
    .update(updateTicketObject)
    .returning('*');

  res.status(StatusCodes.OK).json({ updatedTicket });
};

const deleteTicket = async (req, res) => {
  const { id: ticketId } = req.params;

  const ticket = await pool('tickets').where({ ticket_id: ticketId });

  if (ticket.length === 0) {
    throw new CustomError.NotFoundError(
      `Ticket with id ${ticketId} does not exists`
    );
  }
  checkPermissions(res, req.user, ticket[0].user_id);

  await pool('tickets').where({ ticket_id: ticketId }).del();

  res.status(StatusCodes.OK).json({ message: 'Ticket successfully deleted!' });
};

module.exports = {
  createTicket,
  getAllTickets,
  getSingleTicket,
  updateTicket,
  deleteTicket,
};
