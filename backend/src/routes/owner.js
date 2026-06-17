const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('store_owner'));

// GET store owner dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Get owner's store
    const [stores] = await db.query('SELECT * FROM stores WHERE owner_id = ?', [req.user.id]);
    if (stores.length === 0)
      return res.status(404).json({ message: 'No store found for this owner' });

    const storeId = stores[0].id;

    // Get average rating
    const [[{ avg_rating }]] = await db.query(
      'SELECT ROUND(AVG(rating), 1) as avg_rating FROM ratings WHERE store_id = ?',
      [storeId]
    );

    // Get list of users who rated
    const [raters] = await db.query(
      `SELECT u.name, u.email, r.rating, r.created_at 
       FROM ratings r JOIN users u ON r.user_id = u.id 
       WHERE r.store_id = ? ORDER BY r.created_at DESC`,
      [storeId]
    );

    res.json({ store: stores[0], avg_rating, raters });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;