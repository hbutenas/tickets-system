require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();

// Routers
const authRouter = require('./routes/authRouter');
const ticketsRouter = require('./routes/ticketsRouter');
const adminRouter = require('./routes/adminRouter');

// packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// middlewares
const routeNotFoundMiddleware = require('./middlewares/routeNotFound');
const errorHandlerMiddleware = require('./middlewares/errorHandler');

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('tiny'));
app.use(cookieParser(process.env.JWT_SECRET));

// routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tickets', ticketsRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/', (req, res) => {
  console.log(new Date());
});

app.use(routeNotFoundMiddleware);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}....`);
});
