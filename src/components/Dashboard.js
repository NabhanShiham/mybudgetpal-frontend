import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Modal from './Modal';
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
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: '', allowance: 0 });
  const [categoryError, setCategoryError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [purchase, setPurchase] = useState({ amount: 0, receipt: null });
  const [showAddCategoryPopup, setShowAddCategoryPopup] = useState(false);
  const [showReceiptsPopup, setShowReceiptsPopup] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [enlargedImage, setEnlargedImage] = useState(null);

  const navigate = useNavigate();

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
    if (!userId) return;
  
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
        setCategories(profileData.budgetCategories || []);
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
          switch (error.response.status) {
            case 401:
              setError('Unauthorized Access');
              break;
            case 404:
              setError(null);
              setShowUpdateForm(true);
              break;
            default:
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

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to log out');
    }
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const totalAllowance = categories.reduce((sum, category) => sum + category.allowance, 0) + parseFloat(newCategory.allowance);
    if (totalAllowance > profile.mainBudget) {
      setCategoryError('Total allowance exceeds main budget');
    } else {
      try {
        const response = await api.post(`/${userId}/categories`, newCategory, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setCategories(response.data.budgetCategories);
        setNewCategory({ name: '', allowance: 0 });
        setCategoryError('');
        setShowAddCategoryPopup(false);
      } catch (error) {
        console.error('Error adding category:', error);
        setCategoryError('Failed to add category');
      }
    }
  };

  const handleManageCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleShowReceipts = async () => {
    if (selectedCategory) {
      try {
        const response = await api.get(`/${userId}/categories/${selectedCategory.id}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setReceipts(response.data.receipts);
        setShowReceiptsPopup(true);
      } catch (error) {
        console.error('Error fetching receipts:', error);
        setError('Failed to fetch receipts');
      }
    }
  };

  const handlePurchaseInputChange = (e) => {
    const { name, value } = e.target;
    setPurchase({ ...purchase, [name]: value });
  };

  const handleFileChange = (e) => {
    setPurchase({ ...purchase, receipt: e.target.files[0] });
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    try {
      const categoryResponse = await api.get(`/${userId}/categories/${selectedCategory.id}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const categoryId = categoryResponse.data.id;

      const formData = new FormData();
      formData.append('amount', purchase.amount);
      formData.append('receiptFile', purchase.receipt);

      const response = await api.post(`/${userId}/categories/${categoryId}/purchases`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update the profile and selected category with the new currentSpent values
      setProfile(response.data);
      const updatedCategory = response.data.budgetCategories.find(cat => cat.id === selectedCategory.id);
      setSelectedCategory(updatedCategory);
      setPurchase({ amount: 0, receipt: null });
    } catch (error) {
      console.error('Error adding purchase:', error);
      setError('Failed to add purchase');
    }
    window.location.reload();
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.delete(`/${userId}/categories/${categoryId}`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setCategories(categories.filter(category => category.id !== categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
    }
    window.location.reload();
  };

  const handleImageClick = (index) => {
    setEnlargedImage(enlargedImage === index ? null : index);
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
          <li><Link to="/" onClick={handleLogout}>Logout</Link></li>
          <li><Link to="/friends">Friends</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/collaborate">Collaborate</Link></li>
          <li><Link to="/uom">UOM</Link></li>
        </ul>
      </nav>
      <h1>Welcome to Your Dashboard</h1>
      {profile && (
        <table className="profile-table">
          <tbody>
            <tr>
              <th>Username</th>
              <td>{profile.username}</td>
            </tr>
            <tr>
              <th>First Name</th>
              <td>{profile.firstName}</td>
            </tr>
            <tr>
              <th>Last Name</th>
              <td>{profile.lastName}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{profile.email}</td>
            </tr>
            <tr>
              <th>Phone Number</th>
              <td>{profile.phoneNumber}</td>
            </tr>
            <tr>
              <th>Main Budget</th>
              <td>{profile.mainBudget}</td>
            </tr>
            <tr>
              <th>Current Spent</th>
              <td>{profile.currentSpent}</td>
            </tr>
          </tbody>
        </table>
      )}
      {profile && (
        <button onClick={() => setShowUpdateForm(true)} className="update-button">Update Profile</button>
      )}
      

      {showUpdateForm && (
        <Modal isOpen={showUpdateForm} onClose={() => setShowUpdateForm(false)}>
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
        </Modal>
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

      <div className="categories-container">
        <h2>Budget Categories</h2>
        <button onClick={() => setShowAddCategoryPopup(true)} className="add-category-button">Add Category</button>
        <div className="categories-list">
          {categories.map((category, index) => (
            <div key={index} className="category-card">
              <h3>{category.name}</h3>
              <p>Allowance: {category.allowance}</p>
              <p>Current Spent: {category.currentSpent}</p>
              <button onClick={() => handleManageCategory(category)} className="manage-button">Manage</button>
              <button onClick={() => handleDeleteCategory(category.id)} className="delete-button">Delete</button>
            </div>
          ))}
        </div>
      </div>

      {showAddCategoryPopup && (
        <Modal isOpen={showAddCategoryPopup} onClose={() => setShowAddCategoryPopup(false)}>
          <h2>Add New Category</h2>
          <form onSubmit={handleAddCategory} className="aligned-form">
            <div className="form-group">
              <label>
                Category Name:
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleCategoryInputChange}
                  required
                />
              </label>
              <label>
                Allowance:
                <input
                  type="number"
                  name="allowance"
                  value={newCategory.allowance}
                  onChange={handleCategoryInputChange}
                  required
                />
              </label>
            </div>
            <button type="submit" className="add-category-button green-button">Add Category</button>
            {categoryError && <p className="error">{categoryError}</p>}
          </form>
          <button onClick={() => setShowAddCategoryPopup(false)} className="cancel-button">Cancel</button>
        </Modal>
      )}

      {selectedCategory && (
        <Modal isOpen={!!selectedCategory} onClose={() => setSelectedCategory(null)}>
          <h2>Manage Category: {selectedCategory.name}</h2>
          <form onSubmit={handleAddPurchase} className="aligned-form">
            <div className="form-group">
              <label htmlFor="amount">Amount:</label>
              <input
                type="number"
                name="amount"
                value={purchase.amount}
                onChange={handlePurchaseInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="receipt">Receipt:</label>
              <input
                type="file"
                name="receipt"
                onChange={handleFileChange}
                required
              />
            </div>
            <button type="submit" className="add-purchase-button green-button">Add Purchase</button>
          </form>
          <button type="button" className="show-receipts-button blue-button" onClick={handleShowReceipts}>
            {showReceiptsPopup ? 'Hide Receipts' : 'Show Receipts'}
          </button>
          <button onClick={() => setSelectedCategory(null)} className="cancel-button">Close</button>
        </Modal>
      )}

      {showReceiptsPopup && selectedCategory && (
        <Modal isOpen={showReceiptsPopup} onClose={() => setShowReceiptsPopup(false)}>
          <h2>Receipts for {selectedCategory.name}</h2>
          <table>
            <thead>
              <tr>
                <th>Uploader</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt, index) => (
                <tr key={index}>
                  <td>{receipt.uploader}</td>
                  <td>
                    <img
                      src={`data:image/jpeg;base64,${receipt.receiptImage}`}
                      alt="Receipt"
                      onClick={() => handleImageClick(index)}
                      style={{
                        maxWidth: enlargedImage === index ? '500px' : '100px',
                        height: 'auto',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease',
                        transform: enlargedImage === index ? 'scale(1.5)' : 'scale(1)',
                        position: enlargedImage === index ? 'relative' : 'static',
                        zIndex: enlargedImage === index ? 1 : 0
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={() => setShowReceiptsPopup(false)} className="cancel-button">Close</button>
        </Modal>
      )}
    </div>
  );
}

export default Dashboard;