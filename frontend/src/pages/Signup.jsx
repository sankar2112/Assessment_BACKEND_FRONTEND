import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { graphqlRequest } from '../utils/graphql';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const query = `
        mutation Register($username: String!, $email: String!, $password: String!) {
          register(username: $username, email: $email, password: $password) {
            message
          }
        }
      `;
      
      const variables = {
        username: formData.username,
        email: formData.email,
        password: formData.password
      };
      
      const data = await graphqlRequest(query, variables);
      
      setSuccess(data?.register?.message || 'Registration successful! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldCheck size={28} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us and start your journey</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              minLength={3}
              maxLength={20}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              maxLength={50}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              minLength={6}
              maxLength={40}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
