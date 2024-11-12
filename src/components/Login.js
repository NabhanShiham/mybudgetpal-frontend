import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

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
      const response = await api.post('/auth/login', { username, password });
      if (response.status === 200) {
        const { token } = response.data;
        console.log("Login Success. Token stored: ", token);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Login Failed', error);
    }
  };

  return (
    <div>
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
      <button type="submit">Login</button>
    </form>
    </div>
  );
};

export default LoginPage;
