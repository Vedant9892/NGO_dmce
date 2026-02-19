import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import volunteerRoutes from './routes/volunteer.routes.js';
import ngoRoutes from './routes/ngo.routes.js';
import coordinatorRoutes from './routes/coordinator.routes.js';
import statsRoutes from './routes/stats.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/coordinator', coordinatorRoutes);
app.use('/api/stats', statsRoutes);

app.use(errorHandler);

export default app;
