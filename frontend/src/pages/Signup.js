import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '', address: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/signup', form);
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '420px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center', color: '#1a73e8' }}>Create Account</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name (20-60 characters)</label>
            <input placeholder="Enter your full name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Address (max 400 characters)</label>
            <input placeholder="Enter address" value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Password (8-16 chars, 1 uppercase, 1 special character)</label>
            <input type="password" placeholder="Enter password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary">Sign Up</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#1a73e8' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;