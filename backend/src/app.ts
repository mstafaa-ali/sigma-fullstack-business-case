import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { config } from './config';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGIN }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));
app.use(requestLogger);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import routes from './routes';

// Routes
app.use('/api', routes);
// Error handler (HARUS di paling bawah)
app.use(errorHandler);

export default app;
