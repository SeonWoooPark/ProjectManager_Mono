import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

console.log('[Router Index] Initializing main router...');

// Auth routes
router.use('/auth', (req, _res, next) => {
  console.log('[Router Index] Auth route hit:', req.method, req.path);
  next();
}, authRoutes);

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;