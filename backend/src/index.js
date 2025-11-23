require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

