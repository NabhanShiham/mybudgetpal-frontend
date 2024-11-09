import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// TODO: implement navigation to dashboard upon successful login.


const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(localStorage.getItem(localStorage.getItem("authenticated")|| false));
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if(!username || !password){
      alert('Both username and password should be entered!');
      return;
    }
    try { 
      const response = await api.post('/auth/login', {username, password});
      if (response.status == 200){
        setAuthenticated(true);
        localStorage.setItem("authenticated", true);
        console.log("Login Success.");
        navigate("/dashboard");
      } 
    } catch (error){
      console.error('Login Failed', error);
    }
  };
  
  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholders="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholders="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );

};

export default LoginPage;

