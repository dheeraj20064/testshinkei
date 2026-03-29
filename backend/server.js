const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/loreRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

app.use('/api/order', orderRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Order API is running' });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Order API running on http://localhost:${PORT}`);
});