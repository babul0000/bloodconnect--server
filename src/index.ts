import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import donorRoutes from './routes/donors';
import requestRoutes from './routes/requests';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

app.use(cors());
app.use(express.json());

// Mount Routers
app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: unknown) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function startServer(): Promise<void> {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

if (process.env.VERCEL) {
  connectDB().catch((error) => {
    console.error('Failed to connect to database on Vercel', error);
  });
} else {
  startServer();
}

export default app;