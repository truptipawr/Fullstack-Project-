const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// All admin routes require login + admin role
router.use(authenticate, authorize('admin'));

// GET dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    const [[{ totalUsers }]] = await db.query('SELECT COUNT(*) as totalUsers FROM users WHERE role != "admin"');
    const [[{ totalStores }]] = await db.query('SELECT COUNT(*) as totalStores FROM stores');
    const [[{ totalRatings }]] = await db.query('SELECT COUNT(*) as totalRatings FROM ratings');
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all users with optional filters
router.get('/users', async (req, res) => {
  try {
    const { name, email, address, role, sort, order } = req.query;
    let query = 'SELECT id, name, email, address, role FROM users WHERE 1=1';
    const params = [];

    if (name) { query += ' AND name LIKE ?'; params.push(`%${name}%`); }
    if (email) { query += ' AND email LIKE ?'; params.push(`%${email}%`); }
    if (address) { query += ' AND address LIKE ?'; params.push(`%${address}%`); }
    if (role) { query += ' AND role = ?'; params.push(role); }

    const validSort = ['name', 'email', 'address', 'role'];
    if (sort && validSort.includes(sort)) {
      query += ` ORDER BY ${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;
    }

    const [users] = await db.query(query, params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single user detail
router.get('/users/:id', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, address, role FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = users[0];

    // If store owner, also get their store's average rating
    if (user.role === 'store_owner') {
      const [stores] = await db.query(
        'SELECT s.name as store_name, AVG(r.rating) as avg_rating FROM stores s LEFT JOIN ratings r ON s.id = r.store_id WHERE s.owner_id = ? GROUP BY s.id',
        [user.id]
      );
      user.stores = stores;
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add new user
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;

    if (name.length < 20 || name.length > 60)
      return res.status(400).json({ message: 'Name must be 20-60 characters' });
    if (address && address.length > 400)
      return res.status(400).json({ message: 'Address max 400 characters' });
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(password))
      return res.status(400).json({ message: 'Invalid password format' });

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, address, role || 'user']
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all stores
router.get('/stores', async (req, res) => {
  try {
    const { name, address, sort, order } = req.query;
    let query = `SELECT s.id, s.name, s.email, s.address, 
                 ROUND(AVG(r.rating), 1) as rating 
                 FROM stores s LEFT JOIN ratings r ON s.id = r.store_id WHERE 1=1`;
    const params = [];

    if (name) { query += ' AND s.name LIKE ?'; params.push(`%${name}%`); }
    if (address) { query += ' AND s.address LIKE ?'; params.push(`%${address}%`); }

    query += ' GROUP BY s.id';

    const validSort = ['name', 'email', 'address', 'rating'];
    if (sort && validSort.includes(sort)) {
      query += ` ORDER BY ${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;
    }

    const [stores] = await db.query(query, params);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add new store
router.post('/stores', async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;
    if (name.length < 20 || name.length > 60)
      return res.status(400).json({ message: 'Store name must be 20-60 characters' });
    await db.query(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
      [name, email, address, owner_id || null]
    );
    res.status(201).json({ message: 'Store created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;