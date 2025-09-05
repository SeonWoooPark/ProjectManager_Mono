import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AppError } from './errorHandler';

export const validateRequest = (type: any) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = plainToClass(type, req.body);
      const errors = await validate(dto);
      
      if (errors.length > 0) {
        const message = errors
          .map(error => Object.values(error.constraints || {}).join(', '))
          .join('; ');
        throw new AppError(message, 400);
      }
      
      req.body = dto;
      next();
    } catch (error) {
      next(error);
    }
  };
};