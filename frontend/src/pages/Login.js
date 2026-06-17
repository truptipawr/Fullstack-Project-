import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      // Save token and role to localStorage (like a session)
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      localStorage.setItem('userId', res.data.id);

      // Redirect based on role
      if (res.data.role === 'admin') navigate('/admin');
      else if (res.data.role === 'store_owner') navigate('/owner');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '400px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center', color: '#1a73e8' }}>🏪 Store Rating App</h2>
        <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Login</h3>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#1a73e8' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;