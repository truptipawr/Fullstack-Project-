const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// GET all stores for normal users
router.get('/', authenticate, authorize('user'), async (req, res) => {
  try {
    const { name, address, sort, order } = req.query;
    let query = `SELECT s.id, s.name, s.address, 
                 ROUND(AVG(r.rating), 1) as overall_rating,
                 (SELECT rating FROM ratings WHERE user_id = ? AND store_id = s.id) as user_rating
                 FROM stores s LEFT JOIN ratings r ON s.id = r.store_id WHERE 1=1`;
    const params = [req.user.id];

    if (name) { query += ' AND s.name LIKE ?'; params.push(`%${name}%`); }
    if (address) { query += ' AND s.address LIKE ?'; params.push(`%${address}%`); }

    query += ' GROUP BY s.id';

    const validSort = ['name', 'address', 'overall_rating'];
    if (sort && validSort.includes(sort)) {
      query += ` ORDER BY ${sort} ${order === 'desc' ? 'DESC' : 'ASC'}`;
    }

    const [stores] = await db.query(query, params);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST submit or update rating
router.post('/:id/rate', authenticate, authorize('user'), async (req, res) => {
  try {
    const { rating } = req.body;
    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });

    // INSERT or UPDATE (if already rated)
    await db.query(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE rating = ?',
      [req.user.id, req.params.id, rating, rating]
    );
    res.json({ message: 'Rating submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;