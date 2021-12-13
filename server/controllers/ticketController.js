const { StatusCodes } = require('http-status-codes');
const pool = require('../database/connectDB');

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
  res.send('Get all tickets');
};

const getSingleTicket = async (req, res) => {
  res.send('Get single ticket');
};

const updateTicket = async (req, res) => {
  res.send('Update single ticket');
};

const deleteTicket = async (req, res) => {
  res.send('Delete ticket');
};

module.exports = {
  createTicket,
  getAllTickets,
  getSingleTicket,
  updateTicket,
  deleteTicket,
};
