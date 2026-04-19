import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { graphqlRequest } from '../utils/graphql';

export default function Profile() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    bio: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const query = `
        mutation UpdateProfile($input: ProfileUpdateInput!) {
          updateProfile(input: $input) {
            id
            username
            email
            firstName
            lastName
            phone
            bio
          }
        }
      `;

      const variables = {
        input: {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          bio: formData.bio
        }
      };

      const data = await graphqlRequest(query, variables);

      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Update local user state
      login({ ...user, ...formData }, localStorage.getItem('token'));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });

      // For POC without backend uncomment to fake success
      // login({ ...user, ...formData }, localStorage.getItem('token'));
      // setIsEditing(false);
      // setMessage({ type: 'success', text: 'Profile updated locally (POC mode).' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Profile</h1>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="card-title" style={{ marginBottom: 0 }}>Personal Information</h2>
          {!isEditing && (
            <button className="btn" onClick={() => setIsEditing(true)} style={{ width: 'auto', backgroundColor: 'var(--background)', color: 'var(--text-main)' }}>
              Edit Profile
            </button>
          )}
        </div>

        {message.text && (
          <div className={message.type === 'error' ? 'error-message' : 'success-message'}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form-grid">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              disabled={!isEditing}
              maxLength={50}
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!isEditing}
              maxLength={100}
            />
          </div>

          <div className="input-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              disabled={!isEditing}
              maxLength={200}
            />
          </div>

          <div className="input-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              disabled={!isEditing}
              maxLength={200}
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={formData.phone}
              onChange={handleChange}
              disabled={!isEditing}
              maxLength={20}
            />
          </div>

          <div className="input-group profile-form-full">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="profile-form-full" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setIsEditing(false);
                  setMessage({ type: '', text: '' });
                }}
                style={{ width: 'auto', backgroundColor: 'var(--background)', color: 'var(--text-main)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{ width: 'auto' }}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
