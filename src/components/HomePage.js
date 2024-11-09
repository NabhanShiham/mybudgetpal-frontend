import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
      <p>Make your budgeting goals come true!</p>
      <Link to="/login"> 
        <button>Login</button>
      </Link>
    </div>
  );
}

export default HomePage;
