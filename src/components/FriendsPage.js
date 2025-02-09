import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './styles/FriendsPage.css';

function FriendsPage() {
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendUsername, setFriendUsername] = useState('');
  const [error, setError] = useState(null);
  const [showCollaboratePopup, setShowCollaboratePopup] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        await api.get('/auth/user', { withCredentials: true });
        const userIdResponse = await api.get('/user-id', { withCredentials: true });
        setUserId(userIdResponse.data);

        const friendsResponse = await api.get('/friends', { withCredentials: true });
        setFriends(friendsResponse.data.map(friend => ({
          id: friend.friendId,
          username: friend.friendUsername
        })));

        const pendingRequestsResponse = await api.get('/friends/pending', { withCredentials: true });
        setPendingRequests(pendingRequestsResponse.data);
      } catch (error) {
        setError('Failed to fetch user data');
      }
    };

    fetchUserData();
  }, []);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    try {
      await api.post('/friends/add', null, {
        params: { friendUsername },
        withCredentials: true,
      });
      setFriendUsername('');
      alert('Friend request sent');
    } catch (error) {
      setError('Failed to send friend request');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.post('/friends/accept', null, {
        params: { requestId },
        withCredentials: true,
      });
      alert('Friend request accepted');
    } catch (error) {
      setError('Failed to accept friend request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await api.post('/friends/reject', null, {
        params: { requestId },
        withCredentials: true,
      });
      alert('Friend request rejected');
    } catch (error) {
      setError('Failed to reject friend request');
    }
  };

  const handleCollaborate = () => {
    setShowCollaboratePopup(true);
  };

  const handleCreateProject = async () => {
    try {
      const memberIds = await Promise.all(selectedFriends.map(async (friendUsername) => {
        const response = await api.get(`/users/username/${friendUsername}`, { withCredentials: true });
        return response.data.id;
      }));

      memberIds.unshift(userId); // Add the userId to the beginning of the memberIds array

      await api.post('/collaborateProjects', {
        name: projectName,
        goal: projectGoal,
        memberIds: memberIds,
      }, { withCredentials: true });

      setShowCollaboratePopup(false);
      setProjectName('');
      setProjectGoal('');
      setSelectedFriends([]);
      alert('Collaborate project request sent');
    } catch (error) {
      setError('Failed to create collaborate project');
    }
  };

  return (
    <div className="friends-page-container">
      <nav className="navbar">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/friends">Friends</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/collaborate">Collaborate</Link></li>
          <li><Link to="/uom">UOM</Link></li>
        </ul>
      </nav>
      <h1>Friends Page</h1>
      {error && <div className="message">{error}</div>}
      <div className="add-friend-form">
        <h2>Add Friend</h2>
        <form onSubmit={handleAddFriend}>
          <label>
            Friend's Username:
            <input
                type="text"
                name="friendUsername"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                placeholder="Enter friend's username"
            />
          </label>
          <button type="submit" className="add-friend-button">Add Friend</button>
        </form>
      </div>
      <div className="friends-list">
        <h2>Friends</h2>
        <ul>
          {friends.map((friend) => (
            <li key={friend.id}>
              {friend.username}
              <button onClick={handleCollaborate} className="collaborate-button">Collaborate</button>
              <button className="uom-button">UOM</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="pending-requests">
        <h2>Pending Requests</h2>
        <ul>
          {pendingRequests.map((request) => (
            <li key={request.id}>
              {request.userId}
              <button onClick={() => handleAcceptRequest(request.id)} className="accept-button">Accept</button>
              <button onClick={() => handleRejectRequest(request.id)} className="reject-button">Reject</button>
            </li>
          ))}
        </ul>
      </div>
      {showCollaboratePopup && (
        <div className="collaborate-popup">
          <h2>Create Collaborate Project</h2>
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
          <button onClick={() => setShowCollaboratePopup(false)} className="cancel-button">Cancel</button>
        </div>
      )}
    </div>
  );
}

export default FriendsPage;