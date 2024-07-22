import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import './Header.css'; // Import the CSS file

const Header = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null; // Don't render the header if the user is not authenticated

  return (
    <header className="app-header">
      <div className="header-content">
        <h1 className="app-title">Expense Tracker</h1>
        <nav className="app-nav">
          <Link className="nav-link" to="/dashboard">Dashboard</Link>
          <Link className="nav-link" to="/add-transaction">Add Transaction</Link>
          <Link className="nav-link" to="/logout">Logout</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
