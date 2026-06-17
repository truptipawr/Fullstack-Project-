import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserDashboard() {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState({ name: '', address: '' });
  const [tab, setTab] = useState('stores');
  const [msg, setMsg] = useState('');
  const [pwForm, setPwForm] = useState({ email: '', oldPassword: '', newPassword: '' });
  const [ratings, setRatings] = useState({});

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchStores(); }, []);

  const fetchStores = async () => {
    const res = await axios.get('http://localhost:5000/api/stores', { headers, params: search });
    setStores(res.data);
    // Pre-fill ratings state with existing user ratings
    const r = {};
    res.data.forEach(s => { r[s.id] = s.user_rating || ''; });
    setRatings(r);
  };

  const submitRating = async (storeId) => {
    try {
      await axios.post(`http://localhost:5000/api/stores/${storeId}/rate`,
        { rating: parseInt(ratings[storeId]) }, { headers });
      setMsg('✅ Rating submitted!');
      fetchStores();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error'));
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:5000/api/auth/update-password', pwForm);
      setMsg('✅ Password updated successfully!');
      setPwForm({ email: '', oldPassword: '', newPassword: '' });
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error'));
    }
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  return (
    <div>
      <div className="navbar">
        <h2>🏪 Store Rating App</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>👋 {name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ background: 'white', padding: '0 30px', display: 'flex', gap: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        {['stores', 'change-password'].map(t => (
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

        {/* STORES TAB */}
        {tab === 'stores' && (
          <>
            <div className="search-bar">
              <input placeholder="Search by store name" value={search.name}
                onChange={e => setSearch({ ...search, name: e.target.value })} />
              <input placeholder="Search by address" value={search.address}
                onChange={e => setSearch({ ...search, address: e.target.value })} />
              <button className="btn btn-small" onClick={fetchStores}>Search</button>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Store Name</th><th>Address</th><th>Overall Rating</th>
                  <th>Your Rating</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.address}</td>
                    <td>
                      <span className="stars">{'★'.repeat(Math.round(s.overall_rating || 0))}</span>
                      <span style={{ marginLeft: '6px', color: '#777' }}>{s.overall_rating || 'No ratings'}</span>
                    </td>
                    <td>
                      {s.user_rating
                        ? <span className="stars">{'★'.repeat(s.user_rating)} ({s.user_rating})</span>
                        : <span style={{ color: '#aaa' }}>Not rated</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select className="rating-select" value={ratings[s.id] || ''}
                          onChange={e => setRatings({ ...ratings, [s.id]: e.target.value })}>
                          <option value="">Select</option>
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} ★</option>)}
                        </select>
                        <button className="btn btn-success" onClick={() => submitRating(s.id)}>
                          {s.user_rating ? 'Update' : 'Submit'}
                        </button>
                      </div>
                    </td>
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

export default UserDashboard;