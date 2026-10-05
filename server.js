import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Search endpoint: forward directly to NHL search API
app.get('/api-search/search/player', async (req, res) => {
  try {
    const queryString = new URLSearchParams(req.query).toString();
    const targetUrl = `https://search.d3.nhle.com/api/v1/search/player?${queryString}`;
    
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: `NHL Search API returned ${response.status}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching player search:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Stats endpoint: forward directly to NHL landing API
app.get('/api-nhl/player/:id/landing', async (req, res) => {
  try {
    const targetUrl = `https://api-web.nhle.com/v1/player/${req.params.id}/landing`;
    
    const response = await fetch(targetUrl);
    if (!response.ok) {
      return res.status(response.status).json({ error: `NHL Stats API returned ${response.status}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching player landing stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Serve the production Vite bundle
app.use(express.static(path.join(__dirname, 'dist')));

// 4. Fallback for React Router (Express 5 syntax)
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});