import React from 'react';
import TransactionList from './TransactionList';
import CategoryPieChart from './CategoryPieChart';
import DailySummary from './DailySummary';
import { AuthContext } from '../contexts/AuthContext';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Personal Finance Dashboard</h1>
      <div className="dashboard-content">
        <div className="dashboard-side-by-side">
          <div className="transaction-list">
            <TransactionList />
          </div>
          <div className="daily-summary">
            <DailySummary />
          </div>
        </div>
        <div className="category-pie-chart">
          <CategoryPieChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
