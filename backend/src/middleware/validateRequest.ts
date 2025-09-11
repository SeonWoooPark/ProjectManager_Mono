import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors';

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  console.log('[ValidateRequest] Checking validation errors...');
  
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('[ValidateRequest] Validation errors found:', errors.array());
    const errorMessages = errors.array().map(error => {
      if ('msg' in error) {
        return `${error.msg}`;
      }
      return 'Validation error';
    });
    
    return next(new ValidationError(errorMessages.join(', ')));
  }
  
  console.log('[ValidateRequest] No validation errors, proceeding...');
  next();
};