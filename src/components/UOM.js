import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import './styles/UOM.css';

function UOM() {
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [receiptId, setReceiptId] = useState('');
  const [amount, setAmount] = useState('');
  const [billFile, setBillFile] = useState(null);
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
  const [newAmount, setNewAmount] = useState(''); // Renamed newGoal to newAmount

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
      const response = await api.get(`/uom/incomingRequests?userId=${userId}`, { withCredentials: true });
      setIncomingRequests(response.data);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        setError('Failed to fetch incoming UOM requests');
      }
    }
  };

  const fetchPendingProjects = async (userId) => {
    try {
      const response = await api.get(`/uom/pending?userId=${userId}`, { withCredentials: true });
      setPendingProjects(response.data);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        setError('Failed to fetch pending UOM requests');
      }
    }
  };

  const fetchActiveProjects = async (userId) => {
    try {
      const response = await api.get(`/uom/active?userId=${userId}`, { withCredentials: true });
      setActiveProjects(response.data);
    } catch (error) {
      setError('Failed to fetch active UOMs');
    }
  };

  const handleCreateUOM = async () => {
    const formData = new FormData();
    const project = {
      receiptId,
      amount,
    };

    try {
      const debtorIds = await Promise.all(selectedFriends.map(async (friendUsername) => {
        const response = await api.get(`/users/username/${friendUsername}`, { withCredentials: true });
        return response.data.id;
      }));

      project.debtorId = debtorIds[0]; // Assuming only one debtor for simplicity

      formData.append('project', new Blob([JSON.stringify(project)], { type: 'application/json' }));
      formData.append('receiptFile', billFile);

      await api.post('/uom', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      alert('UOM created successfully');
      setReceiptId('');
      setAmount('');
      setBillFile(null);
      setSelectedFriends([]);
      fetchPendingProjects(userId); // Refresh pending UOMs
    } catch (error) {
      setError('Failed to create UOM');
    }
  };

  const handleAcceptRequest = async (uomId) => {
    try {
      await api.post(`/uom/invitations/${uomId}/accept?userId=${userId}`, {}, { withCredentials: true });
      setIncomingRequests(incomingRequests.filter(request => request.id !== uomId));
      alert('UOM request accepted');
      fetchActiveProjects(userId); // Refresh active UOMs
    } catch (error) {
      setError('Failed to accept UOM request');
    }
  };

  const handleRejectRequest = async (uomId) => {
    try {
      await api.delete(`/uom/reject/${uomId}`, { data: { userId }, withCredentials: true });
      setIncomingRequests(incomingRequests.filter(request => request.id !== uomId));
      alert('UOM request rejected');
    } catch (error) {
      setError('Failed to reject UOM request');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await api.delete(`/uom/${projectId}`, { withCredentials: true });
      alert('Project deleted successfully');
      fetchActiveProjects(userId); // Refresh active projects
    } catch (error) {
      setError('Failed to delete project');
    }
  };

  const handleUpdateAmount = async (projectId) => {
    try {
      await api.put(`/uom/${projectId}/amount`, null, {
        params: { newAmount }, // Updated to newAmount
        withCredentials: true,
      });
      alert('Project goal updated');
      fetchActiveProjects(userId); // Refresh active projects
    } catch (error) {
      setError('Failed to update project goal');
    }
  };

  const handleAddContribution = async (uomId) => {
    const formData = new FormData();
    formData.append('amount', contributionAmount);
    formData.append('receiptFile', receiptFile);

    try {
      await api.post(`/uom/${uomId}/contribute`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });
      alert('Contribution added');
      setContributionAmount('');
      setReceiptFile(null);
      setSelectedProject(null);
      fetchActiveProjects(userId); // Refresh active UOMs
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
      <h1>You Owe Me!</h1>
      {error && <div className="message">{error}</div>}
      <button onClick={() => setShowForm(!showForm)} className="toggle-form-button">
        {showForm ? 'Hide Form' : 'Create new UOM'}
      </button>
      {showForm && (
        <div className="collaborate-form">
          <label>
            Receipt ID:
            <input
              type="text"
              value={receiptId}
              onChange={(e) => setReceiptId(e.target.value)}
              placeholder="Enter receipt ID"
            />
          </label>
          <label>
            Amount:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </label>
          <label>
            Bill/Invoice:
            <input
              type="file"
              onChange={(e) => setBillFile(e.target.files[0])}
              accept="application/pdf,image/*"
            />
          </label>
          <h3>Select Friend</h3>
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
          <button onClick={handleCreateUOM} className="create-project-button">Create UOM</button>
        </div>
      )}
      {incomingRequests.length > 0 && (
        <>
          <h2>Incoming UOM Requests</h2>
          <div className="incoming-requests">
            {incomingRequests.map((request) => (
              <div key={request.id} className="request-card">
                <h3>{request.receiptId}</h3>
                <p>Amount: {request.amount}</p>
                <button onClick={() => handleAcceptRequest(request.id)} className="accept-button">Accept</button>
                <button onClick={() => handleRejectRequest(request.id)} className="reject-button">Reject</button>
              </div>
            ))}
          </div>
        </>
      )}
      {pendingProjects.length > 0 && (
        <>
          <h2>Pending UOMs</h2>
          <div className="pending-projects">
            {pendingProjects.map((project) => (
              <div key={project.id} className="project-card">
                <h3>{project.receiptId}</h3>
                <p>Amount: ${project.amount}</p>
                <p>Status: Pending</p>
              </div>
            ))}
          </div>
        </>
      )}
      <h2>Active UOMs</h2>
      <div className="active-projects">
        {activeProjects.length > 0 ? (
          activeProjects.map((project) => (
            <div key={project.id} className="project-card">
              <h3>{project.receiptId}</h3>
              <p>Amount: ${project.amount}</p>
              <p>Currently Paid: ${project.currentProgress} / ${project.amount}</p>
              <progress value={project.currentProgress} max={project.amount}></progress>
              <button onClick={() => setSelectedProject(selectedProject === project.id ? null : project.id)} className="manage-button">
                {selectedProject === project.id ? 'Hide Manage' : 'Manage'}
              </button>
              {selectedProject === project.id && (
                <div>
                  {project.creator === userId && (
                    <>
                      <div className="update-goal-form">
                        <label>
                          New Goal:
                          <input
                            type="number"
                            value={newAmount} // Updated to newAmount
                            onChange={(e) => setNewAmount(e.target.value)} // Updated to newAmount
                            placeholder="Enter new goal"
                          />
                        </label>
                        <button onClick={() => handleUpdateAmount(project.id)} className="update-goal-button">Update Goal</button>
                      </div>
                      <button onClick={() => handleDeleteProject(project.id)} className="delete-project-button">Delete Project</button>
                    </>
                  )}
                  <div className="contribution-form">
                    <label>
                      Currently Paid:
                      <input
                        type="number"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        placeholder="Enter payment amount"
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
          <p>No active UOMs</p>
        )}
      </div>
    </div>
  );
}

export default UOM;