import React, { useEffect, useState } from 'react';
import api from '../api';

function Dashboard() {
  const [profile, setProfile] = useState({});

  useEffect( () => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setProfile(response.data);
        console.log("Profile fetched: ", response.data);
      } catch (error) {
        console.error("Error fetching profile!", error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {profile.username ? (
        <div>
          <p>Username: {profile.username}</p>
          <p>First Name: {profile.firstName}</p>
          <p>Last Name: {profile.lastName} </p>
          <p>Email: {profile.Email}</p>
          <p>Main Budget: {profile.mainBudget}</p>
        </div>
      ):(
        <p>Loading profile...</p>
      )}
    </div>
  );
}

export default Dashboard;
