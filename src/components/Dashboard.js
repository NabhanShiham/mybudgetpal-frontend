import React, { useEffect, useState } from 'react';
import api from '../api';

// TODO:  actually implement a method to retrieve and maintain userID information in local storage.

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    mainBudget: 0,
    currentSpent: 0,
  });

  // Fetch user profile 
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Assuming the user ID is available via authentication context or local storage
        const userId = "USER_ID";  // Replace with actual method to retrieve user ID
        const response = await api.get(`/user-profiles/${userId}`);
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const createUserProfile = async (profileData) => {
    try {
      const response = await api.post("/user-profiles", profileData);
      if (response.status == 200) {
        console.log("Profile created successfully:", response.data);
        setProfile(response.data);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    await createUserProfile(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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
          <form onSubmit={handleFormSubmit}>
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <label>First Name:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <label>Last Name:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <label>Phone Number:</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
            <label>Main Budget:</label>
            <input
              type="number"
              name="mainBudget"
              value={formData.mainBudget}
              onChange={handleChange}
              required
            />
            <label>Current Spent:</label>
            <input
              type="number"
              name="currentSpent"
              value={formData.currentSpent}
              onChange={handleChange}
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
