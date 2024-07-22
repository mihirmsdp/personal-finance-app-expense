import React from 'react';
import { Link } from 'react-router-dom';
import './BasePage.css'; // Ensure this path is correct

function BasePage() {
  return (
    <div className="base-page-container">
      <div className="button-container">
        <Link to="/login" className="cartoon-button">Login</Link>
        <Link to="/register" className="cartoon-button">Register</Link>
      </div>
    </div>
  );
}

export default BasePage;
