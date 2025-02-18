import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './styles/Login.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Both username and password should be entered!');
      return;
    }
    try {
      const params = new URLSearchParams();
      params.append('username', username);
      params.append('password', password);

      const response = await api.post('/auth/login', params, {
        withCredentials: true, // Include cookies in the request
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      if (response.status === 200) {
        console.log('Login Success.');
        
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login Failed', error);
    }
  };

  return (
    <div className="login-container">
      <h1>Log in</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={!username || !password}>
          Login
        </button>
        <br/>
        <button onClick={()=> navigate("/")}>Back</button>
      </form>
    </div>
  );
};

export default LoginPage;