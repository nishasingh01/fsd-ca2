require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express()
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studentFeedbackDB';

app.use(express.json());
app.use('/api/feedback', feedbackRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Student Feedback Management API is running' });
});

app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    console.log('Starting server without database connection. Please check MongoDB and restart.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
