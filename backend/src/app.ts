import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// CORS configuration matching frontend expectations & custom headers
app.use(
  cors({
    origin: [CLIENT_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Platform-Region'],
    credentials: true,
  })
);

app.use(express.json());

// Request logging in development
app.use((req: Request, res: Response, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'Smriti-Setu AI Gaming & Healthcare API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    region: 'Northeast India Ecosystem (NER)',
    supportedStates: [
      'Assam',
      'Arunachal Pradesh',
      'Manipur',
      'Meghalaya',
      'Mizoram',
      'Nagaland',
      'Sikkim',
      'Tripura',
    ],
  });
});

// Mount all modular domain APIs
app.use('/api', apiRouter);

// Centralized error handler
app.use(errorHandler);

export default app;
