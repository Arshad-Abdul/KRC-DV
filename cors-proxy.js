// Simple CORS Proxy Server for Scopus API
// Run this with: node cors-proxy.js
// Then update the SCOPUS_BASE_URL in scopusApi.js to use http://localhost:3001/proxy

import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Proxy endpoint for Scopus API
app.get('/proxy/*', async (req, res) => {
  try {
    const scopusPath = req.path.replace('/proxy', '');
    const scopusUrl = 'https://api.elsevier.com/content' + scopusPath + '?' + new URLSearchParams(req.query).toString();
    
    console.log('Proxying request to:', scopusUrl);
    
    const response = await fetch(scopusUrl, {
      method: 'GET',
      headers: {
        'X-ELS-APIKey': req.headers['x-els-apikey'] || '45ffcd08728def3545ed81fd42148ba3',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy server error: ' + error.message });
  }
});

app.listen(PORT, () => {
  console.log(`CORS Proxy server running on http://localhost:${PORT}`);
  console.log('Update SCOPUS_BASE_URL to: http://localhost:3001/proxy');
});

// To install dependencies:
// npm install express cors node-fetch
