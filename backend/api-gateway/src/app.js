require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(cors());

// Health check (DevSecOps)
app.get('/health', (_req, res) => {
  res.json({ status: 'api-gateway OK' });
});

// AUTH → users-service
app.use(
  '/auth',
  createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL || 'http://users-service:3001',
    changeOrigin: true,
  }),
);

// COURSES → academic-service
app.use(
  '/courses',
  createProxyMiddleware({
    target: process.env.ACADEMIC_SERVICE_URL || 'http://academic-service:3002',
    changeOrigin: true,
  }),
);

module.exports = app;
