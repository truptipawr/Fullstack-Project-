import React, { useState, useEffect } from 'react';
import axios from 'axios';

function OwnerDashboard() {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('dashboard');
  const [msg, setMsg] = useState('');
  const [pwForm, setPwForm] = useState({ email: '', oldPassword: '', newPassword: '' });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    const res = await axios.get('http://localhost:5000/api/owner/dashboard', { headers });
    setData(res.data);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/auth/update-password', pwForm);
      setMsg('✅ Password updated successfully!');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error'));
    }
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  return (
    <div>
      <div className="navbar">
        <h2>🏪 Store Owner Panel</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>👋 {name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ background: 'white', padding: '0 30px', display: 'flex', gap: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        {['dashboard', 'change-password'].map(t => (
          <button key={t} onClick={() => { setTab(t); setMsg(''); }}
            style={{ padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
              borderBottom: tab === t ? '3px solid #1a73e8' : '3px solid transparent',
              color: tab === t ? '#1a73e8' : '#555', fontWeight: tab === t ? 'bold' : 'normal', textTransform: 'capitalize' }}>
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div className="container" style={{ marginTop: '24px' }}>
        {msg && <div className={`alert ${msg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>{msg}</div>}

        {/* DASHBOARD TAB */}
        {tab === 'dashboard' && data && (
          <>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
              <div className="stat-card">
                <h3>{data.store.name}</h3>
                <p>Your Store</p>
              </div>
              <div className="stat-card">
                <h3 className="stars">{'★'.repeat(Math.round(data.avg_rating || 0))}</h3>
                <p>Average Rating: {data.avg_rating || 'No ratings yet'}</p>
              </div>
            </div>
            <h3 style={{ marginBottom: '16px' }}>Users Who Rated Your Store</h3>
            <table>
              <thead>
                <tr><th>Name</th><th>Email</th><th>Rating</th><th>Date</th></tr>
              </thead>
              <tbody>
                {data.raters.length === 0
                  ? <tr><td colSpan="4" style={{ textAlign: 'center', color: '#aaa' }}>No ratings yet</td></tr>
                  : data.raters.map((r, i) => (
                    <tr key={i}>
                      <td>{r.name}</td>
                      <td>{r.email}</td>
                      <td><span className="stars">{'★'.repeat(r.rating)}</span> ({r.rating})</td>
                      <td>{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}

        {/* CHANGE PASSWORD TAB */}
        {tab === 'change-password' && (
          <div className="card" style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '20px' }}>Change Password</h3>
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-group">
                <label>Your Email</label>
                <input type="email" value={pwForm.email}
                  onChange={e => setPwForm({ ...pwForm, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Old Password</label>
                <input type="password" value={pwForm.oldPassword}
                  onChange={e => setPwForm({ ...pwForm, oldPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" value={pwForm.newPassword}
                  onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
              </div>
              <button type="submit" className="btn btn-primary">Update Password</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default OwnerDashboard;