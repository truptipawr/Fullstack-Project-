import React, { useState, useEffect } from 'react';
import axios from 'axios';

const api = (token) => axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { Authorization: `Bearer ${token}` }
});

function AdminDashboard() {
  const token = localStorage.getItem('token');
  const name = localStorage.getItem('name');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [tab, setTab] = useState('dashboard');
  const [filters, setFilters] = useState({ name: '', email: '', address: '', role: '' });
  const [sort, setSort] = useState({ field: 'name', order: 'asc' });
  const [msg, setMsg] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', address: '', role: 'user' });
  const [newStore, setNewStore] = useState({ name: '', email: '', address: '', owner_id: '' });

  useEffect(() => { fetchStats(); fetchUsers(); fetchStores(); }, []);

  const fetchStats = async () => {
    const res = await api(token).get('/admin/dashboard');
    setStats(res.data);
  };

  const fetchUsers = async () => {
    const res = await api(token).get('/admin/users', { params: { ...filters, sort: sort.field, order: sort.order } });
    setUsers(res.data);
  };

  const fetchStores = async () => {
    const res = await api(token).get('/admin/stores', { params: { sort: sort.field, order: sort.order } });
    setStores(res.data);
  };

  const handleSort = (field) => {
    const order = sort.field === field && sort.order === 'asc' ? 'desc' : 'asc';
    setSort({ field, order });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api(token).post('/admin/users', newUser);
      setMsg('✅ User added successfully!');
      setNewUser({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error adding user'));
    }
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    try {
      await api(token).post('/admin/stores', newStore);
      setMsg('✅ Store added successfully!');
      setNewStore({ name: '', email: '', address: '', owner_id: '' });
      fetchStores();
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'Error adding store'));
    }
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  const sortArrow = (field) => sort.field === field ? (sort.order === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <div>
      <div className="navbar">
        <h2>🏪 Store Rating App — Admin</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>👋 {name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: 'white', padding: '0 30px', display: 'flex', gap: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
        {['dashboard', 'users', 'stores', 'add-user', 'add-store'].map(t => (
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
        {tab === 'dashboard' && (
          <div className="stats-grid">
            <div className="stat-card"><h3>{stats.totalUsers || 0}</h3><p>Total Users</p></div>
            <div className="stat-card"><h3>{stats.totalStores || 0}</h3><p>Total Stores</p></div>
            <div className="stat-card"><h3>{stats.totalRatings || 0}</h3><p>Total Ratings</p></div>
          </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && (
          <>
            <div className="search-bar">
              {['name', 'email', 'address'].map(f => (
                <input key={f} placeholder={`Filter by ${f}`} value={filters[f]}
                  onChange={e => setFilters({ ...filters, [f]: e.target.value })} />
              ))}
              <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}>
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="store_owner">Store Owner</option>
              </select>
              <button className="btn btn-small" onClick={fetchUsers}>Search</button>
            </div>
            <table>
              <thead>
                <tr>
                  {['name', 'email', 'address', 'role'].map(f => (
                    <th key={f} onClick={() => { handleSort(f); fetchUsers(); }}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}{sortArrow(f)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.name}</td><td>{u.email}</td><td>{u.address}</td>
                    <td><span style={{ background: '#e8f0fe', color: '#1a73e8', padding: '3px 10px', borderRadius: '12px', fontSize: '12px' }}>{u.role}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* STORES TAB */}
        {tab === 'stores' && (
          <table>
            <thead>
              <tr>
                {['name', 'email', 'address', 'rating'].map(f => (
                  <th key={f} onClick={() => { handleSort(f); fetchStores(); }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}{sortArrow(f)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stores.map(s => (
                <tr key={s.id}>
                  <td>{s.name}</td><td>{s.email}</td><td>{s.address}</td>
                  <td><span className="stars">{'★'.repeat(Math.round(s.rating || 0))}</span> {s.rating || 'No ratings'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ADD USER TAB */}
        {tab === 'add-user' && (
          <div className="card" style={{ maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '20px' }}>Add New User</h3>
            <form onSubmit={handleAddUser}>
              {[['name', 'Full Name (20-60 chars)'], ['email', 'Email'], ['address', 'Address'], ['password', 'Password']].map(([field, label]) => (
                <div className="form-group" key={field}>
                  <label>{label}</label>
                  <input type={field === 'password' ? 'password' : 'text'} value={newUser[field]}
                    onChange={e => setNewUser({ ...newUser, [field]: e.target.value })} required />
                </div>
              ))}
              <div className="form-group">
                <label>Role</label>
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                  <option value="user">Normal User</option>
                  <option value="admin">Admin</option>
                  <option value="store_owner">Store Owner</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Add User</button>
            </form>
          </div>
        )}

        {/* ADD STORE TAB */}
        {tab === 'add-store' && (
          <div className="card" style={{ maxWidth: '500px' }}>
            <h3 style={{ marginBottom: '20px' }}>Add New Store</h3>
            <form onSubmit={handleAddStore}>
              {[['name', 'Store Name (20-60 chars)'], ['email', 'Email'], ['address', 'Address']].map(([field, label]) => (
                <div className="form-group" key={field}>
                  <label>{label}</label>
                  <input value={newStore[field]} onChange={e => setNewStore({ ...newStore, [field]: e.target.value })} required />
                </div>
              ))}
              <div className="form-group">
                <label>Owner ID (optional)</label>
                <input value={newStore.owner_id} onChange={e => setNewStore({ ...newStore, owner_id: e.target.value })}
                  placeholder="Enter user ID of store owner" />
              </div>
              <button type="submit" className="btn btn-primary">Add Store</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;