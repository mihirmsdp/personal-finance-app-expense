import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DailySummary.css';

function DailySummary() {
  const [totalSpentToday, setTotalSpentToday] = useState(0);
  const [averageDailySpend, setAverageDailySpend] = useState(0);
  const [topCategories, setTopCategories] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem('token'); // Assumes JWT is stored in localStorage
        const res = await axios.get('https://personal-finance-app-expense-backend.onrender.com/api/transactions', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const transactions = res.data;

        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const transactionsThisMonth = transactions.filter((tx) => new Date(tx.date) >= startOfMonth);

        const totalSpentToday = transactions
          .filter((tx) => new Date(tx.date).toDateString() === today.toDateString() && tx.type === 'expense')
          .reduce((acc, tx) => acc + tx.amount, 0);

        const dailySpend = transactionsThisMonth.reduce((acc, tx) => {
          if (tx.type === 'expense') {
            const date = new Date(tx.date).toDateString();
            acc[date] = (acc[date] || 0) + tx.amount;
          }
          return acc;
        }, {});

        const totalDays = Object.keys(dailySpend).length;
        const totalSpentThisMonth = Object.values(dailySpend).reduce((a, b) => a + b, 0);
        const averageDailySpend = totalDays ? totalSpentThisMonth / totalDays : 0;

        const categories = transactions
          .filter(tx => tx.type === 'expense')
          .reduce((acc, tx) => {
            acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
            return acc;
          }, {});

        const sortedCategories = Object.entries(categories)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([category, amount]) => ({ category, amount }));

        setTotalSpentToday(totalSpentToday);
        setAverageDailySpend(averageDailySpend);
        setTopCategories(sortedCategories);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="daily-summary-container">
      <h2 className="daily-summary-title">Daily Summary</h2>
      <div className="summary-item">
        <h3 className="summary-label">Total Spent Today</h3>
        <p className="summary-value">${totalSpentToday.toFixed(2)}</p>
      </div>
      <div className="summary-item">
        <h3 className="summary-label">Average Daily Spend (Last 30 Days)</h3>
        <p className="summary-value">${averageDailySpend.toFixed(2)}</p>
      </div>
      <div className="summary-item">
        <h3 className="summary-label">Top Spending Categories</h3>
        <ul className="top-categories-list">
          {topCategories.map((cat, index) => (
            <li key={index} className="top-categories-item">
              {cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}: ${cat.amount.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default DailySummary;
