import { Request, Response, NextFunction } from 'express';

export const timeoutMiddleware = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        console.error(`⏰ Request timeout after ${timeoutMs}ms:`, req.method, req.url);
        res.status(408).json({
          success: false,
          message: 'Request timeout. Please try again.'
        });
      }
    }, timeoutMs);

    // Clear timeout when response is sent
    res.on('finish', () => {
      clearTimeout(timeout);
    });

    res.on('close', () => {
      clearTimeout(timeout);
    });

    next();
  };
};