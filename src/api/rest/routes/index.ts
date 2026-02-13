import { Router } from 'express';
import { authRouter } from './auth';
import { pagesRouter } from './pages';
import { propertiesRouter } from './properties';

const router = Router();

// Mount all API routes
router.use('/auth', authRouter);
router.use('/pages', pagesRouter);
router.use('/properties', propertiesRouter);

export default router;
