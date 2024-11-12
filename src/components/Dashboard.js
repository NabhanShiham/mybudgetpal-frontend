import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

// TODO:  actually implement a method to retrieve and maintain userID information in local storage.

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [newProfile, setNewProfile] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    mainBudget: 0,
    currentSpent: 0,
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/api/user-profiles/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProfile(response.data);
      } catch (error) {
        if (error.response){
          if (error.response.status === 401){
            setError("Unauthorized Access");
          } else if (error.response.status === 404){
            setError("User profile not found");
          } else {
            setError("Failed to fetch user profile");
          }
        } else {
          setError("Network error or server unreachable");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProfile({ ...newProfile, [name]: value });
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/user-profiles', newProfile, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate(0); // Reload the page to fetch the new profile
    } catch (error) {
      setError('Failed to create user profile');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Dashboard</h2>
      {profile ? (
        <div>
          <h3>Welcome to your profile, {profile.username}!</h3>
          <p>First Name: {profile.firstName}</p>
          <p>Last Name: {profile.lastName}</p>
          <p>Email: {profile.email}</p>
          <p>Phone Number: {profile.phoneNumber}</p>
          <p>Main Budget: {profile.mainBudget}</p>
          <p>Current Spent: {profile.currentSpent}</p>
        </div>
      ) : (
        <div>
          <h1>Let's create your profile!</h1>
          <form onSubmit={handleCreateProfile}>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={newProfile.username}
              onChange={handleInputChange}
              required
            />
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={newProfile.firstName}
              onChange={handleInputChange}
              required
            />
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={newProfile.lastName}
              onChange={handleInputChange}
              required
            />
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={newProfile.email}
              onChange={handleInputChange}
              required
            />
            <label>Phone Number:</label>
            <input
              type="tel"
              name="phoneNumber"
              value={newProfile.phoneNumber}
              onChange={handleInputChange}
              required
            />
            <label>Main Budget:</label>
            <input
              type="number"
              name="mainBudget"
              value={newProfile.mainBudget}
              onChange={handleInputChange}
              required
            />
            <label>Current Spent:</label>
            <input
              type="number"
              name="currentSpent"
              value={newProfile.currentSpent}
              onChange={handleInputChange}
              required
            />
            <button type="submit">Create Profile</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
