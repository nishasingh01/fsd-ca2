const express = require('express');
const Feedback = require('../models/Feedback');

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { studentName, courseName, message, rating } = req.body;

    if (!studentName || !courseName || !message || rating === undefined) {
      return res.status(400).json({
        message: 'studentName, courseName, message, and rating are required',
      });
    }

    const parsedRating = Number(rating);

    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        message: 'Rating must be an integer between 1 and 5',
      });
    }

    const feedback = await Feedback.create({
      studentName: studentName.trim(),
      courseName: courseName.trim(),
      message: message.trim(),
      rating: parsedRating,
      status: 'Pending',
    });

    return res.status(201).json(feedback);
  } catch (error) {
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const [feedback, totalRecords] = await Promise.all([
      Feedback.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Feedback.countDocuments(),
    ]);

    return res.status(200).json({
      feedback,
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
    });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status || !['Pending', 'Reviewed'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be Pending or Reviewed',
      });
    }

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    return res.status(200).json(feedback);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid feedback ID' });
    }

    return next(error);
  }
});

module.exports=router;
