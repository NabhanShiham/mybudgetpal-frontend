import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './styles/CollaborateProject.css';

function CollaborateProject() {
  const [friends, setFriends] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activeProjects, setActiveProjects] = useState([]);
  const [pendingProjects, setPendingProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [receiptFile, setReceiptFile] = useState(null);
  const [showReceipts, setShowReceipts] = useState(false);
  const [userId, setUserId] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await api.get('/auth/user', { withCredentials: true });
        setUserId(userResponse.data.id);

        fetchFriends();
        fetchIncomingRequests(userResponse.data.id);
        fetchActiveProjects(userResponse.data.id);
        fetchPendingProjects(userResponse.data.id);
      } catch (error) {
        setError('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await api.get('/friends', { withCredentials: true });
      setFriends(response.data.map(friend => ({
        id: friend.friendId,
        username: friend.friendUsername
      })));
    } catch (error) {
      setError('Failed to fetch friends');
    }
  };

  const fetchIncomingRequests = async (userId) => {
    try {
      const response = await api.get(`/collaborateProjects/incomingRequests?userId=${userId}`, { withCredentials: true });
      setIncomingRequests(response.data);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        setError('Failed to fetch incoming project requests');
      }
    }
  };

  const fetchPendingProjects = async (userId) => {
    try {
      const response = await api.get(`/collaborateProjects/pending?userId=${userId}`, { withCredentials: true });
      setPendingProjects(response.data);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        setError('Failed to fetch pending project requests');
      }
    }
  };

  const fetchActiveProjects = async (userId) => {
    try {
      const response = await api.get(`/collaborateProjects/active?userId=${userId}`, { withCredentials: true });
      setActiveProjects(response.data);
    } catch (error) {
      setError('Failed to fetch active projects');
    }
  };

  const handleCreateProject = async () => {
    try {
      const memberIds = await Promise.all(selectedFriends.map(async (friendUsername) => {
        const response = await api.get(`/users/username/${friendUsername}`, { withCredentials: true });
        return response.data.id;
      }));

      await api.post('/collaborateProjects', {
        name: projectName,
        goal: projectGoal,
        memberIds: memberIds,
      }, { withCredentials: true });
      setProjectName('');
      setProjectGoal('');
      setSelectedFriends([]);
      alert('Collaborate project request sent');
      fetchPendingProjects(userId); // Refresh pending projects
    } catch (error) {
      setError('Failed to create collaborate project');
    }
  };

  const handleAcceptRequest = async (projectId) => {
    try {
      await api.post(`/collaborateProjects/invitations/${projectId}/accept?userId=${userId}`, {}, { withCredentials: true });
      setIncomingRequests(incomingRequests.filter(request => request.id !== projectId));
      alert('Project request accepted');
      fetchActiveProjects(userId); // Refresh active projects
    } catch (error) {
      setError('Failed to accept project request');
    }
  };

  const handleRejectRequest = async (projectId) => {
    try {
      await api.delete(`/collaborateProjects/invitations/${projectId}/reject?userId=${userId}`, { withCredentials: true });
      setIncomingRequests(incomingRequests.filter(request => request.id !== projectId));
      alert('Project request rejected');
    } catch (error) {
      setError('Failed to reject project request');
    }
  };

  const handleAddContribution = async (projectId) => {
    const formData = new FormData();
    formData.append('amount', contributionAmount);
    formData.append('receiptFile', receiptFile);

    try {
      await api.post(`/collaborateProjects/${projectId}/contribute`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      alert('Contribution added');
      setContributionAmount('');
      setReceiptFile(null);
      setSelectedProject(null);
      fetchActiveProjects(userId); // Refresh active projects
    } catch (error) {
      setError('Failed to add contribution');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out');
    }
  };

  return (
    <div className="collaborate-project-container">
      <nav className="navbar">
        <ul>
          <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
          <li><Link to="/friends">Friends</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/collaborate">Collaborate</Link></li>
          <li><Link to="/uom">UOM</Link></li>
        </ul>
      </nav>
      <h1>Collaborate Projects</h1>
      {error && <div className="message">{error}</div>}
      <button onClick={() => setShowForm(!showForm)} className="toggle-form-button">
        {showForm ? 'Hide Form' : 'Create New Project'}
      </button>
      {showForm && (
        <div className="collaborate-form">
          <label>
            Project Name:
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name"
            />
          </label>
          <label>
            Project Goal:
            <input
              type="number"
              value={projectGoal}
              onChange={(e) => setProjectGoal(e.target.value)}
              placeholder="Enter project goal"
            />
          </label>
          <h3>Select Friends</h3>
          <ul>
            {friends.map((friend) => (
              <li key={friend.id}>
                <label>
                  <input
                    type="checkbox"
                    value={friend.username}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFriends([...selectedFriends, friend.username]);
                      } else {
                        setSelectedFriends(selectedFriends.filter(username => username !== friend.username));
                      }
                    }}
                  />
                  {friend.username}
                </label>
              </li>
            ))}
          </ul>
          <button onClick={handleCreateProject} className="create-project-button">Create Project</button>
        </div>
      )}
      {incomingRequests.length > 0 && (
        <>
          <h2>Incoming Project Requests</h2>
          <div className="incoming-requests">
            {incomingRequests.map((request) => (
              <div key={request.id} className="request-card">
                <h3>{request.name}</h3>
                <p>Goal: {request.goal}</p>
                <button onClick={() => handleAcceptRequest(request.id)} className="accept-button">Accept</button>
                <button onClick={() => handleRejectRequest(request.id)} className="reject-button">Reject</button>
              </div>
            ))}
          </div>
        </>
      )}
      {pendingProjects.length > 0 && (
        <>
          <h2>Pending Collaborate Projects</h2>
          <div className="pending-projects">
            {pendingProjects.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.name}</h3>
                <p>Goal: ${project.goal}</p>
                <p>Status: Pending</p>
              </div>
            ))}
          </div>
        </>
      )}
      <h2>Active Collaborate Projects</h2>
      <div className="active-projects">
        {activeProjects.length > 0 ? (
          activeProjects.map((project) => (
            <div key={project.id} className="project-card">
              <h3>{project.name}</h3>
              <p>Goal: ${project.goal}</p>
              <p>Progress: ${project.currentProgress} / ${project.goal}</p>
              <progress value={project.currentProgress} max={project.goal}></progress>
              <button onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)} className="manage-button">
                {selectedProject === project.id ? 'Hide Manage' : 'Manage'}
              </button>
              {selectedProject === project.id && (
                <div>
                  <div className="contribution-form">
                    <label>
                      Contribution Amount:
                      <input
                        type="number"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="Enter contribution amount"
                      />
                    </label>
                    <label>
                      Receipt:
                      <input
                        type="file"
                        onChange={(e) => setReceiptFile(e.target.files[0])}
                        accept="application/pdf,image/*"
                      />
                    </label>
                    <button onClick={() => handleAddContribution(project.id)} className="add-contribution-button">Add Contribution</button>
                  </div>
                  <button onClick={() => setShowReceipts(!showReceipts)} className="toggle-receipts-button">
                    {showReceipts ? 'Hide Receipts' : 'Show Receipts'}
                  </button>
                  {showReceipts && (
                    <div className="receipt-table">
                      <h3>Receipts</h3>
                      <table>
                        <thead>
                          <tr>
                            <th>Uploader</th>
                            <th>Receipt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.receipts.map((receipt, index) => (
                            <tr key={index}>
                              <td>{receipt.uploader}</td>
                              <td><img src={`data:image/jpeg;base64,${receipt.receiptImage}`} alt="Receipt" /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No active collaborate projects</p>
        )}
      </div>
    </div>
  );
}

export default CollaborateProject;