require('dotenv').config();

// Routers
const authRouter = require('./routes/authRouter');

const express = require('express');
const app = express();

// packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(morgan('tiny'));
app.use(cookieParser(process.env.JWT_SECRET));

// routes
app.use('/api/v1/auth', authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}....`);
});
