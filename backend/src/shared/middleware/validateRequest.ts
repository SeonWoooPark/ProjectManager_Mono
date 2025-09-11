import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => {
      if ('msg' in error) {
        return `${error.msg}`;
      }
      return 'Validation error';
    });
    
    return next(new ValidationError(errorMessages.join(', ')));
  }
  
  next();
};