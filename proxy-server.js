// Simple CORS Proxy Server for Scopus API
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Simple proxy endpoint
app.use('/proxy', async (req, res) => {
  try {
    const scopusPath = req.url;
    const scopusUrl = 'https://api.elsevier.com/content' + scopusPath;
    
    console.log('Proxying request to:', scopusUrl);
    
    const response = await fetch(scopusUrl, {
      method: req.method,
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
