import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import Login from './components/Login.js';
import Dashboard from './components/Dashboard.js';
import './App.css';
import FriendsPage from './components/FriendsPage.js';
import CollaborateProject from './components/CollaborateProject.js';

function App() {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />}/>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/friends" element= {<FriendsPage />} /> 
          <Route path="/collaborate" element=  {<CollaborateProject/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
