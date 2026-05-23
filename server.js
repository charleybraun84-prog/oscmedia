import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import handler from './api/sandbox/generate.js';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and JSON parsing middlewares
app.use(cors());
app.use(express.json());

// Proxy requests to the unified Vercel-style handler
app.post('/api/sandbox/generate', handler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server is running on port ${PORT}`);
});
