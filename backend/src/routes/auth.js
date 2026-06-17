const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// SIGNUP — POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    // Validations (like Python if/elif checks)
    if (name.length < 20 || name.length > 60)
      return res.status(400).json({ message: 'Name must be 20-60 characters' });
    if (address && address.length > 400)
      return res.status(400).json({ message: 'Address max 400 characters' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: 'Invalid email' });
    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(password))
      return res.status(400).json({ message: 'Password must be 8-16 chars with uppercase and special character' });

    // Hash password (never store plain text passwords!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into database
    await db.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, address, 'user']
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Email already exists' });
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN — POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0)
      return res.status(400).json({ message: 'Invalid credentials' });

    const user = users[0];

    // Compare password with hashed one in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    // Create a token (like a session key) valid for 24 hours
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, role: user.role, name: user.name, id: user.id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// UPDATE PASSWORD — PUT /api/auth/update-password
router.put('/update-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/.test(newPassword))
      return res.status(400).json({ message: 'Password must be 8-16 chars with uppercase and special character' });

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0)
      return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, users[0].password);
    if (!isMatch)
      return res.status(400).json({ message: 'Old password incorrect' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE email = ?', [hashed, email]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;