import { ValidationChain, body, query, param } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ValidationError } from '../../../shared/utils/errors';

/**
 * Base Validator 클래스
 * 모든 validator가 상속받아 사용하는 기본 클래스
 */
export abstract class BaseValidator {
  /**
   * Validation 체인을 실행하는 미들웨어 생성
   */
  static validate(validations: ValidationChain[]) {
    return async (req: Request, _res: Response, next: NextFunction) => {
      // 모든 validation 체인을 순차 실행
      for (const validation of validations) {
        const result = await validation.run(req);
        if (!result.isEmpty()) {
          break;
        }
      }

      // validation 결과 확인
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => {
          if ('msg' in error) {
            return error.msg as string;
          }
          return 'Validation error';
        });
        
        return next(new ValidationError(errorMessages.join(', ')));
      }

      next();
    };
  }

  /**
   * 이메일 validation 규칙
   */
  static emailRule(fieldName: string = 'email', isOptional: boolean = false) {
    const rule = body(fieldName)
      .isEmail()
      .withMessage('유효한 이메일을 입력해주세요')
      .normalizeEmail();
    
    return isOptional ? rule.optional() : rule;
  }

  /**
   * 비밀번호 validation 규칙
   */
  static passwordRule(fieldName: string = 'password', isOptional: boolean = false) {
    const rule = body(fieldName)
      .isLength({ min: 8, max: 128 })
      .withMessage('비밀번호는 8~128자 사이여야 합니다');

    return isOptional ? rule.optional() : rule;
  }

  /**
   * 이름 validation 규칙
   */
  static nameRule(fieldName: string = 'name', isOptional: boolean = false) {
    const rule = body(fieldName)
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage(`${fieldName}은 1~100자 사이여야 합니다`)
      .matches(/^[가-힣a-zA-Z\s]+$/)
      .withMessage('이름은 한글, 영문, 공백만 사용할 수 있습니다');

    return isOptional ? rule.optional() : rule;
  }

  /**
   * 전화번호 validation 규칙
   */
  static phoneRule(fieldName: string = 'phone_number', isOptional: boolean = true) {
    const rule = body(fieldName)
      .trim()
      .matches(/^[0-9+\-\s()]+$/)
      .withMessage('유효한 전화번호를 입력해주세요')
      .isLength({ min: 10, max: 20 })
      .withMessage('전화번호는 10~20자 사이여야 합니다');

    return isOptional ? rule.optional() : rule;
  }

  /**
   * UUID validation 규칙
   */
  static uuidRule(fieldName: string, location: 'body' | 'query' | 'param' = 'body', isOptional: boolean = false) {
    let rule;
    switch (location) {
      case 'body':
        rule = body(fieldName);
        break;
      case 'query':
        rule = query(fieldName);
        break;
      case 'param':
        rule = param(fieldName);
        break;
    }

    rule = rule.matches(/^[a-zA-Z0-9]{3}_[a-zA-Z0-9]{6,}$/)
      .withMessage(`올바른 ${fieldName} 형식이 아닙니다`);

    return isOptional ? rule.optional() : rule;
  }

  /**
   * 토큰 validation 규칙
   */
  static tokenRule(fieldName: string = 'token', location: 'body' | 'query' = 'body', isOptional: boolean = false) {
    let rule;
    switch (location) {
      case 'body':
        rule = body(fieldName);
        break;
      case 'query':
        rule = query(fieldName);
        break;
    }

    rule = rule.trim()
      .isLength({ min: 1 })
      .withMessage('토큰이 유효하지 않습니다');

    return isOptional ? rule.optional() : rule;
  }

  /**
   * 액션 validation 규칙
   */
  static actionRule(fieldName: string = 'action', allowedValues: string[], isOptional: boolean = false) {
    const rule = body(fieldName)
      .isIn(allowedValues)
      .withMessage(`유효한 액션을 선택해주세요. 허용된 값: ${allowedValues.join(', ')}`);

    return isOptional ? rule.optional() : rule;
  }

  /**
   * 코멘트 validation 규칙
   */
  static commentRule(fieldName: string = 'comment', isOptional: boolean = true) {
    const rule = body(fieldName)
      .trim()
      .isLength({ max: 500 })
      .withMessage('코멘트는 500자를 초과할 수 없습니다');

    return isOptional ? rule.optional() : rule;
  }

  /**
   * Boolean validation 규칙
   */
  static booleanRule(fieldName: string, isOptional: boolean = true) {
    const rule = body(fieldName)
      .isBoolean()
      .withMessage(`${fieldName}은 boolean 값이어야 합니다`);

    return isOptional ? rule.optional() : rule;
  }
}