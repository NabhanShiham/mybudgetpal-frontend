import React from 'react';
import { Link } from 'react-router-dom';
import './styles/HomePage.css';

function HomePage() {
  return (
    <div className="home-container">
      <h1>Welcome to MyBudgetPal</h1>
      <p>Make your budgeting goals come true!</p>
      <Link to="/login">
        <button>Login</button>
      </Link>
    </div>
  );
}

export default HomePage;
