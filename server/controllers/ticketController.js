const { StatusCodes } = require('http-status-codes');
const pool = require('../database/connectDB');
const checkPermissions = require('../utils/checkPermissions');
const createTicket = async (req, res) => {
  const { title, description } = req.body;

  try {
    if (!title || !description) {
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Please provide all values' });
    }
    const ticket = await pool.query(
      'INSERT INTO tickets(title,description,user_id) VALUES($1,$2,$3) RETURNING *',
      [title, description, req.user.userId]
    );
    res.status(StatusCodes.CREATED).json({ ticket: ticket.rows[0] });
  } catch (error) {
    console.error(error.message);
  }
};

const getAllTickets = async (req, res) => {
  try {
    const tickets = await pool.query('SELECT * FROM tickets');
    if (tickets.rows.length === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `Currently we don't have any tickets` });
    }
    res.status(StatusCodes.OK).json({ tickets: tickets.rows });
  } catch (error) {
    console.error(error.message);
  }
};

const getSingleTicket = async (req, res) => {
  const { id: ticketId } = req.params;
  try {
    const ticket = await pool.query(
      'SELECT * FROM tickets WHERE ticket_id = $1',
      [ticketId]
    );
    if (ticket.rows.length === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `Ticket with id ${ticketId} does not exists` });
    }
    res.status(StatusCodes.OK).json({ ticket: ticket.rows[0] });
  } catch (error) {
    console.error(error.message);
  }
};

const updateTicket = async (req, res) => {
  const { id: ticketId } = req.params;
  const { title, description } = req.body;
  try {
    const ticket = await pool.query(
      'SELECT * FROM tickets WHERE ticket_id = $1',
      [ticketId]
    );

    if (ticket.rows.length === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `Ticket with id ${ticketId} does not exists` });
    }

    // allow only to update tickets only for people who created it or for owner/admin/it_support roles.
    checkPermissions(res, req.user, ticket.rows[0].user_id);

    await pool.query(
      'UPDATE tickets SET title = $1, description = $2 WHERE ticket_id = $3',
      [title, description, ticketId]
    );

    res
      .status(StatusCodes.OK)
      .json({ message: 'Ticket successfully updated!' });
  } catch (error) {
    console.error(error.message);
  }
};

const deleteTicket = async (req, res) => {
  const { id: ticketId } = req.params;
  try {
    const ticket = await pool.query(
      'SELECT * FROM tickets WHERE ticket_id = $1',
      [ticketId]
    );

    if (ticket.rows.length === 0) {
      res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `Ticket with id ${ticketId} does not exists` });
    }

    checkPermissions(res, req.user, ticket.rows[0].user_id);

    await pool.query('DELETE FROM tickets WHERE ticket_id = $1', [ticketId]);
    res
      .status(StatusCodes.OK)
      .json({ message: 'Ticket successfully deleted!' });
  } catch (error) {
    console.error(error.message);
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getSingleTicket,
  updateTicket,
  deleteTicket,
};
