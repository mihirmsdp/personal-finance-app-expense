import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import './CategoryPieChart.css'; // Import the CSS file

ChartJS.register(Title, Tooltip, Legend, ArcElement);

function CategoryPieChart() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Spending by Category',
        data: [],
        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#ff9f40'],
        borderColor: '#000', // Dark black border
        borderWidth: 3, // Cartoonish border width
      },
    ],
  });

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

  useEffect(() => {
    const processCategoryData = () => {
      const categories = transactions.reduce((acc, transaction) => {
        if (transaction.type === 'expense') {
          acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        }
        return acc;
      }, {});

      setChartData({
        labels: Object.keys(categories),
        datasets: [
          {
            label: 'Spending by Category',
            data: Object.values(categories),
            backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#ff9f40'],
            borderColor: '#000', // Dark black border
            borderWidth: 3, // Cartoonish border width
          },
        ],
      });
    };

    processCategoryData();
  }, [transactions]);

  const downloadChart = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pie-chart.png';
      link.click();
    }
  };

  return (
    <div className="pie-chart-container">
      <h2 className="pie-chart-title">Spending by Category</h2>
      {error && <div className="pie-chart-error">{error}</div>}
      <div className="pie-chart-wrapper">
        <Pie
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                labels: {
                  color: '#333',
                  fontSize: 14,
                  boxWidth: 20
                }
              },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    const label = tooltipItem.label || '';
                    const value = tooltipItem.raw || 0;
                    const percentage = ((value / chartData.datasets[0].data.reduce((a, b) => a + b, 0)) * 100).toFixed(2);
                    return `${label}: $${value} (${percentage}%)`;
                  }
                }
              }
            },
            animation: {
              animateRotate: true,
              animateScale: true
            },
          }}
        />
      </div>
      <button className="download-button" onClick={downloadChart}>Download Chart</button>
    </div>
  );
}

export default CategoryPieChart;
