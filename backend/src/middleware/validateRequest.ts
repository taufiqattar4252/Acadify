import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodError } from 'zod';
import AppError from '../utils/AppError';

export const validateRequest = (schema: ZodObject<any, any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`);
        return next(new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400));
      }
      next(error);
    }
  };
};
