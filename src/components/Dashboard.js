import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './styles/Dashboard.css';

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [error, setError] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [newProfile, setNewProfile] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    mainBudget: 0,
    currentSpent: 0,
  });

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await api.get('/user-id', { withCredentials: true });
        if (response.status === 200) {
          setUserId(response.data);
        } else {
          console.error('Failed to fetch userId, status:', response.status);
          setError('Failed to fetch userId');
        }
      } catch (error) {
        console.error('Failed to fetch userId', error);
        setError('Failed to fetch userId');
        setLoading(false);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchUserProfile = async () => {
        try {
          const response = await api.get(`/user-profiles/${userId}`, {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            },
          });
          const profileData = response.data;
          setProfile(profileData);
          setNewProfile({
            username: profileData.username || '',
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            email: profileData.email || '',
            phoneNumber: profileData.phoneNumber || '',
            mainBudget: profileData.mainBudget || 0,
            currentSpent: profileData.currentSpent || 0,
          });
        } catch (error) {
          if (error.response) {
            if (error.response.status === 401) {
              setError('Unauthorized Access');
            } else if (error.response.status === 404) {
              setError(null);
              setShowUpdateForm(true);
            } else {
              setError('Failed to fetch user profile');
            }
          } else {
            setError('Network error or server unreachable');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchUserProfile();
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProfile({ ...newProfile, [name]: value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put('/user-profiles', newProfile, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setProfile(response.data);
      alert('Profile updated successfully');
      setShowUpdateForm(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response) {
        if (error.response.status === 401) {
          setError('Unauthorized Access');
        } else if (error.response.status === 404) {
          setError('Profile not found. Please create a new profile.');
        } else {
          setError('Failed to update profile');
        }
      } else {
        setError('Network error or server unreachable');
      }
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/user-profiles', newProfile, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setProfile(response.data);
      alert('Profile created successfully');
      setShowUpdateForm(false);
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create profile');
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/friends">Friends</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/collaborate">Collaborate</Link></li>
          <li><Link to="/uom">UOM</Link></li>
        </ul>
      </nav>
      <h1>Welcome to Your Dashboard</h1>
      {profile && (
        <div className="profile-card">
          <h2>Profile Information</h2>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>First Name:</strong> {profile.firstName}</p>
          <p><strong>Last Name:</strong> {profile.lastName}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Phone Number:</strong> {profile.phoneNumber}</p>
          <p><strong>Main Budget:</strong> {profile.mainBudget}</p>
          <p><strong>Current Spent:</strong> {profile.currentSpent}</p>
          <button onClick={() => setShowUpdateForm(true)} className="update-button">Update Profile</button>
        </div>
      )}

      {showUpdateForm && (
        <div className="update-form-container">
          <h2>{profile ? 'Update Your Profile' : 'Create Your Profile'}</h2>
          <form onSubmit={profile ? handleUpdateProfile : handleCreateProfile} className="update-form">
            <label>
              Username:
              <input
                type="text"
                name="username"
                value={newProfile.username}
                readOnly
              />
            </label>
            <label>
              First Name:
              <input
                type="text"
                name="firstName"
                value={newProfile.firstName}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Last Name:
              <input
                type="text"
                name="lastName"
                value={newProfile.lastName}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                name="email"
                value={newProfile.email}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Phone Number:
              <input
                type="text"
                name="phoneNumber"
                value={newProfile.phoneNumber}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Main Budget:
              <input
                type="number"
                name="mainBudget"
                value={newProfile.mainBudget}
                onChange={handleInputChange}
              />
            </label>
            <label>
              Current Spent:
              <input
                type="number"
                name="currentSpent"
                value={newProfile.currentSpent}
                onChange={handleInputChange}
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="save-button">{profile ? 'Save Changes' : 'Create Profile'}</button>
              <button type="button" onClick={() => setShowUpdateForm(false)} className="cancel-button">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {profile && (
        <div className="budget-progress">
          <h2>Budget Progress</h2>
          <table>
            <thead>
              <tr>
                <th>Current Spent</th>
                <th>Main Budget</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{profile.currentSpent}</td>
                <td>{profile.mainBudget}</td>
                <td>
                  <div className="progress-bar">
                    <div
                      className="progress"
                      style={{ width: `${(profile.currentSpent / profile.mainBudget) * 100}%` }}
                    ></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Dashboard;