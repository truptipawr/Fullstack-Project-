// This is the entry point — like Python's main.py
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware — runs on every request (like Python decorators)
app.use(cors());                        // Allow frontend to call backend
app.use(express.json());               // Parse JSON request bodies

// Routes — like Flask blueprints
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/stores', require('./src/routes/stores'));
app.use('/api/owner', require('./src/routes/owner'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});