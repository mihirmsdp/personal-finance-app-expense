const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { 
    type: String,
    required: function() { return this.type === 'expense'; } // Make category required only if type is 'expense'
  },
  date: { type: Date, default: Date.now },
  description: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Added user field
});

// Pre-save hook to set default description
TransactionSchema.pre('save', function(next) {
  if (this.type === 'income' && !this.description) {
    this.description = 'Income';
  }
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);
