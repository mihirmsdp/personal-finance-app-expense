const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(helmet()); // Adds security headers
app.use(morgan('dev')); // Logs requests to the console

// Connect to MongoDB
const { MONGODB_URI, JWT_SECRET, PORT } = process.env;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error('Error: Missing environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
const authRoutes = require('./api/auth/auth.routes');
const transactionRoutes = require('./routes/transactions');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

const serverPort = PORT || 5000;
app.listen(serverPort, () => console.log(`Server running on port ${serverPort}`));
