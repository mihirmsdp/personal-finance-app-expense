import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './TransactionList.css';

function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [openTransactionId, setOpenTransactionId] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token'); // Assumes JWT is stored in localStorage
        const res = await axios.get('https://personal-finance-app-expense-backend.onrender.com/api/transactions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch transactions');
      }
    };
    fetchTransactions();
  }, []);

  const startOfDay = (date) => {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (date) => {
    if (!date) return null;
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const filteredTransactions = transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const isWithinDateRange =
      (!startDate || transactionDate >= startOfDay(startDate)) &&
      (!endDate || transactionDate <= endOfDay(endDate)) &&
      (!selectedMonth || transactionDate.getMonth() === new Date(selectedMonth).getMonth() &&
        transactionDate.getFullYear() === new Date(selectedMonth).getFullYear());
    const matchesSearchQuery =
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase());
    return isWithinDateRange && matchesSearchQuery;
  });

  const totalIncome = filteredTransactions
    .filter(transaction => transaction.type === 'income')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const totalExpenses = filteredTransactions
    .filter(transaction => transaction.type === 'expense')
    .reduce((acc, transaction) => acc + transaction.amount, 0);
  const balance = totalIncome - totalExpenses;

  const handleItemClick = (id) => {
    setOpenTransactionId(prevId => (prevId === id ? null : id));
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token'); // Assumes JWT is stored in localStorage
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setTransactions(transactions.filter(transaction => transaction._id !== id));
      alert('Transaction deleted successfully!');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      alert('Error deleting transaction: ' + (err.response ? err.response.data.message : err.message));
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Monthly Financial Report', 10, 10);
    autoTable(doc, {
      startY: 20,
      head: [['Description', 'Amount', 'Type', 'Category', 'Date']],
      body: filteredTransactions.map(transaction => [
        transaction.description,
        transaction.amount.toFixed(2),
        transaction.type,
        transaction.category,
        new Date(transaction.date).toLocaleDateString()
      ]),
    });
    doc.save('monthly-report.pdf');
  };

  const csvData = filteredTransactions.map(transaction => ({
    Description: transaction.description,
    Amount: transaction.amount.toFixed(2),
    Type: transaction.type,
    Category: transaction.category,
    Date: new Date(transaction.date).toLocaleDateString()
  }));

  return (
    <div className="transaction-container">
      <h2 className="title">Recent Transactions</h2>
      {error && <div className="error">{error}</div>}
      <div className="filter-container">
        <div className="filter-group">
          <input
            className="search-input"
            type="text"
            placeholder="Search by description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-group date-filter">
          <label htmlFor="start-date" className="date-label">Start Date:</label>
          <input
            className="date-input"
            type="date"
            id="start-date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
          <label htmlFor="end-date" className="date-label">End Date:</label>
          <input
            className="date-input"
            type="date"
            id="end-date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <ul className="list">
        {filteredTransactions.map(transaction => (
          <li
            key={transaction._id}
            className="list-item"
            onClick={() => handleItemClick(transaction._id)}
          >
            <span className="description">{transaction.description}</span>
            <span className={`amount ${transaction.type}`}>${transaction.amount} ({transaction.type})</span>
            <div className={`dropdown ${openTransactionId === transaction._id ? 'visible' : ''}`}>
              <div><strong>Category:</strong> {transaction.category}</div>
              <div><strong>Date:</strong> {new Date(transaction.date).toLocaleDateString()}</div>
              <button className="delete-button" onClick={() => handleDelete(transaction._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="balance-row">
        <span>Total Income:</span>
        <span>${totalIncome.toFixed(2)}</span>
      </div>
      <div className="balance-row">
        <span>Total Expenses:</span>
        <span>${totalExpenses.toFixed(2)}</span>
      </div>
      <div className="balance-row">
        <span>Balance:</span>
        <span>${balance.toFixed(2)}</span>
      </div>
      <label htmlFor="month" className="date-label">Select Month:</label>
      <input
        className="date-input"
        type="month"
        id="month"
        value={selectedMonth}
        onChange={e => setSelectedMonth(e.target.value)}
      />
      <div className="export-buttons">
        <button onClick={generatePDF}>Export as PDF</button>
        <CSVLink data={csvData} filename={"monthly-report.csv"}>
          <button>Export as CSV</button>
        </CSVLink>
      </div>
    </div>
  );
}

export default TransactionList;
