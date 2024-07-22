import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddTransaction.css'; // Ensure this path is correct

function AddTransaction() {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const categories = [
    'Food',
    'Entertainment',
    'Study',
    'Transportation',
    'Housing',
    'Utilities',
    'Healthcare',
    'Personal',
    'Clothing',
    'Gifts',
    'Savings',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Assumes JWT is stored in localStorage
      const response = await axios.post('https://personal-finance-app-expense-backend.onrender.com/api/transactions', {
        amount: parseFloat(amount),
        type,
        category: type === 'income' ? '' : category, // Send empty category if type is 'income'
        description
      }, {
        headers: {
          Authorization: `Bearer ${token}` // Attach the token to the request
        }
      });
      console.log('Transaction added successfully:', response.data);
      alert('Transaction added successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error adding transaction:', err.response ? err.response.data : err.message);
      alert('Error adding transaction: ' + (err.response ? err.response.data.message : err.message));
    }
  };

  return (
    <div className="add-transaction-container">
      <h2>Add New Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input 
            type="number" 
            id="amount"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="Enter amount" 
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select 
            id="type"
            value={type} 
            onChange={(e) => setType(e.target.value)}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        {type === 'expense' && (
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select 
              id="category"
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>
        )}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <input 
            type="text" 
            id="description"
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Enter description" 
          />
        </div>
        <button type="submit">Add Transaction</button>
      </form>
    </div>
  );
}

export default AddTransaction;
