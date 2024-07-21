const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Create a new transaction
router.post('/', auth, async (req, res) => {
  try {
    // Validate request body
    const { amount, type, category, description } = req.body;
    if (type === 'expense' && !category) {
      return res.status(400).json({ message: 'Category is required for expenses' });
    }

    // Create and save transaction
    const newTransaction = new Transaction({
      amount,
      type,
      category,
      description,
      user: req.user.id // Associate transaction with logged-in user
    });
    const savedTransaction = await newTransaction.save();
    res.json(savedTransaction);
  } catch (err) {
    console.error('Error saving transaction:', err);
    res.status(400).json({ message: err.message });
  }
});

// Get transactions for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }); // Filter by user ID
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: err.message });
  }
});

// Delete a transaction by ID
router.delete('/:id', auth, async (req, res) => {
  try {
    // Ensure the transaction belongs to the user before deleting
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found or not authorized to delete' });
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
