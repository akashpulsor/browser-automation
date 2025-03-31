// src/routes/browserRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import { BrowserController } from '../controllers/browserController';

const router = express.Router();
const browserController = new BrowserController();

// Wrap async route handlers to handle promises
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

router.post('/launch', asyncHandler(async (req: Request, res: Response) => {
  console.log(req);
  const result = await browserController.launchBrowser(req);
  res.json(result);
}));

router.post('/close', asyncHandler(async (req: Request, res: Response) => {
  const result = await browserController.closeBrowser();
  res.json(result);
}));

export default router;