import { Request, Response, NextFunction } from 'express';
import {
  DbConstraintValidator,
  IdValidator,
  LengthValidator,
  RangeValidator,
  DateValidator,
  EnumValidator,
  CONSTRAINTS,
} from '../utils/dbConstraints';
import { ValidationError } from '../utils/errors';

/**
 * Database constraint validation middleware factory
 * 데이터베이스 제약조건 검증 미들웨어 팩토리
 */

interface ValidationRule {
  field: string;
  validator: (value: any) => { valid: boolean; errors: string[] };
  required?: boolean;
}

/**
 * 일반적인 제약조건 검증 미들웨어
 */
export const validateDbConstraints = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = getValueFromRequest(req, rule.field);

      // 필수 필드 체크
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field}은(는) 필수 항목입니다`);
        continue;
      }

      // 값이 있을 때만 검증
      if (value !== undefined && value !== null && value !== '') {
        const result = rule.validator(value);
        if (!result.valid) {
          errors.push(...result.errors);
        }
      }
    }

    if (errors.length > 0) {
      throw new ValidationError(errors.join(', '));
    }

    next();
  };
};

/**
 * 중첩된 경로에서 값 가져오기
 */
function getValueFromRequest(req: Request, path: string): any {
  const keys = path.split('.');
  let value: any = req.body;

  for (const key of keys) {
    if (value && typeof value === 'object') {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * 사용자 생성 검증 미들웨어
 */
export const validateUserCreation = validateDbConstraints([
  {
    field: 'user.email',
    validator: (value) => LengthValidator.validateEmail(value),
    required: true,
  },
  {
    field: 'user.user_name',
    validator: (value) => LengthValidator.validateUserName(value),
    required: true,
  },
  {
    field: 'user.phone_number',
    validator: (value) => LengthValidator.validatePhoneNumber(value),
    required: false,
  },
]);

/**
 * 회사 관리자 회원가입 검증 미들웨어
 */
export const validateCompanyManagerSignup = validateDbConstraints([
  {
    field: 'user.email',
    validator: (value) => LengthValidator.validateEmail(value),
    required: true,
  },
  {
    field: 'user.user_name',
    validator: (value) => LengthValidator.validateUserName(value),
    required: true,
  },
  {
    field: 'user.phone_number',
    validator: (value) => LengthValidator.validatePhoneNumber(value),
    required: false,
  },
  {
    field: 'company.company_name',
    validator: (value) => LengthValidator.validateCompanyName(value),
    required: true,
  },
  {
    field: 'company.company_description',
    validator: (value) => LengthValidator.validateDescription(value, 'company'),
    required: false,
  },
]);

/**
 * 팀원 회원가입 검증 미들웨어
 */
export const validateTeamMemberSignup = validateDbConstraints([
  {
    field: 'user.email',
    validator: (value) => LengthValidator.validateEmail(value),
    required: true,
  },
  {
    field: 'user.user_name',
    validator: (value) => LengthValidator.validateUserName(value),
    required: true,
  },
  {
    field: 'user.phone_number',
    validator: (value) => LengthValidator.validatePhoneNumber(value),
    required: false,
  },
  {
    field: 'invitation_code',
    validator: (value) => IdValidator.validateInvitationCode(value),
    required: true,
  },
]);

/**
 * 프로젝트 생성 검증 미들웨어
 */
export const validateProjectCreation = validateDbConstraints([
  {
    field: 'project_name',
    validator: (value) => LengthValidator.validateProjectName(value),
    required: true,
  },
  {
    field: 'project_description',
    validator: (value) => LengthValidator.validateDescription(value, 'project'),
    required: false,
  },
  {
    field: 'company_id',
    validator: (value) => IdValidator.validateCompanyId(value),
    required: true,
  },
  {
    field: 'progress_rate',
    validator: (value) => RangeValidator.validateProgressRate(value),
    required: false,
  },
  {
    field: 'status_id',
    validator: (value) => RangeValidator.validateProjectStatusId(value),
    required: false,
  },
]);

/**
 * 프로젝트 날짜 검증 미들웨어
 */
export const validateProjectDates = (req: Request, res: Response, next: NextFunction) => {
  const { start_date, end_date } = req.body;
  
  if (start_date && end_date) {
    const result = DateValidator.validateDateRange(start_date, end_date);
    if (!result.valid) {
      throw new ValidationError(result.errors.join(', '));
    }
  }
  
  next();
};

/**
 * 작업 생성 검증 미들웨어
 */
export const validateTaskCreation = validateDbConstraints([
  {
    field: 'task_name',
    validator: (value) => LengthValidator.validateTaskName(value),
    required: true,
  },
  {
    field: 'task_description',
    validator: (value) => LengthValidator.validateDescription(value, 'task'),
    required: false,
  },
  {
    field: 'project_id',
    validator: (value) => IdValidator.validateProjectId(value),
    required: true,
  },
  {
    field: 'assignee_id',
    validator: (value) => IdValidator.validateUserId(value),
    required: false,
  },
  {
    field: 'status_id',
    validator: (value) => RangeValidator.validateTaskStatusId(value),
    required: false,
  },
  {
    field: 'progress_rate',
    validator: (value) => RangeValidator.validateProgressRate(value),
    required: false,
  },
]);

/**
 * 작업 날짜 검증 미들웨어
 */
export const validateTaskDates = (req: Request, res: Response, next: NextFunction) => {
  const { start_date, end_date } = req.body;
  
  if (start_date && end_date) {
    const result = DateValidator.validateDateRange(start_date, end_date);
    if (!result.valid) {
      throw new ValidationError(result.errors.join(', '));
    }
  }
  
  next();
};

/**
 * ID 파라미터 검증 미들웨어
 */
export const validateIdParam = (idType: 'user' | 'company' | 'project' | 'task') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    
    let result;
    switch (idType) {
      case 'user':
        result = IdValidator.validateUserId(id);
        break;
      case 'company':
        result = IdValidator.validateCompanyId(id);
        break;
      case 'project':
        result = IdValidator.validateProjectId(id);
        break;
      case 'task':
        result = IdValidator.validateTaskId(id);
        break;
    }
    
    if (!result.valid) {
      throw new ValidationError(result.errors.join(', '));
    }
    
    next();
  };
};

/**
 * 진행률 업데이트 검증 미들웨어
 */
export const validateProgressUpdate = (req: Request, res: Response, next: NextFunction) => {
  const { progress_rate } = req.body;
  
  if (progress_rate !== undefined && progress_rate !== null) {
    const result = RangeValidator.validateProgressRate(progress_rate);
    if (!result.valid) {
      throw new ValidationError(result.errors.join(', '));
    }
  }
  
  next();
};

/**
 * 상태 업데이트 검증 미들웨어
 */
export const validateStatusUpdate = (entityType: 'user' | 'company' | 'project' | 'task') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { status_id } = req.body;
    
    if (status_id !== undefined && status_id !== null) {
      let result;
      switch (entityType) {
        case 'user':
        case 'company':
          result = RangeValidator.validateUserStatusId(status_id);
          break;
        case 'project':
          result = RangeValidator.validateProjectStatusId(status_id);
          break;
        case 'task':
          result = RangeValidator.validateTaskStatusId(status_id);
          break;
      }
      
      if (!result.valid) {
        throw new ValidationError(result.errors.join(', '));
      }
    }
    
    next();
  };
};

/**
 * 역할 검증 미들웨어
 */
export const validateRole = (req: Request, res: Response, next: NextFunction) => {
  const { role_id } = req.body;
  
  if (role_id !== undefined && role_id !== null) {
    const result = RangeValidator.validateRoleId(role_id);
    if (!result.valid) {
      throw new ValidationError(result.errors.join(', '));
    }
  }
  
  next();
};

/**
 * 리뷰 생성 검증 미들웨어
 */
export const validateReviewCreation = validateDbConstraints([
  {
    field: 'task_id',
    validator: (value) => IdValidator.validateTaskId(value),
    required: true,
  },
  {
    field: 'assignee_id',
    validator: (value) => IdValidator.validateUserId(value),
    required: true,
  },
  {
    field: 'manager_id',
    validator: (value) => IdValidator.validateUserId(value),
    required: true,
  },
  {
    field: 'comment',
    validator: (value) => LengthValidator.validateComment(value),
    required: false,
  },
  {
    field: 'status_id',
    validator: (value) => RangeValidator.validateTaskStatusId(value),
    required: false,
  },
]);

/**
 * 활동 로그 생성 검증 미들웨어
 */
export const validateActivityLogCreation = validateDbConstraints([
  {
    field: 'task_id',
    validator: (value) => IdValidator.validateTaskId(value),
    required: false,
  },
  {
    field: 'project_id',
    validator: (value) => IdValidator.validateProjectId(value),
    required: false,
  },
  {
    field: 'changed_by',
    validator: (value) => IdValidator.validateUserId(value),
    required: true,
  },
  {
    field: 'action',
    validator: (value) => {
      if (!value || value.length > 100) {
        return { valid: false, errors: ['활동 내용은 100자를 초과할 수 없습니다'] };
      }
      return { valid: true, errors: [] };
    },
    required: true,
  },
]);

/**
 * 프로젝트 할당 검증 미들웨어
 */
export const validateProjectAllocation = validateDbConstraints([
  {
    field: 'user_id',
    validator: (value) => IdValidator.validateUserId(value),
    required: true,
  },
  {
    field: 'project_id',
    validator: (value) => IdValidator.validateProjectId(value),
    required: true,
  },
]);

/**
 * 토큰 블랙리스트 검증 미들웨어
 */
export const validateTokenBlacklist = validateDbConstraints([
  {
    field: 'jti',
    validator: (value) => LengthValidator.validateJti(value),
    required: true,
  },
  {
    field: 'token_type',
    validator: (value) => EnumValidator.validateTokenType(value),
    required: true,
  },
  {
    field: 'user_id',
    validator: (value) => IdValidator.validateUserId(value),
    required: false,
  },
  {
    field: 'reason',
    validator: (value) => EnumValidator.validateBlacklistReason(value),
    required: false,
  },
]);

/**
 * 벌크 데이터 길이 검증
 */
export const validateBulkDataLengths = (req: Request, res: Response, next: NextFunction) => {
  const errors: string[] = [];

  // 이메일 길이 체크
  if (req.body.email && req.body.email.length > CONSTRAINTS.EMAIL_MAX_LENGTH) {
    errors.push(`이메일은 ${CONSTRAINTS.EMAIL_MAX_LENGTH}자를 초과할 수 없습니다`);
  }

  // 사용자 이름 길이 체크
  if (req.body.user_name && req.body.user_name.length > CONSTRAINTS.USER_NAME_MAX_LENGTH) {
    errors.push(`사용자 이름은 ${CONSTRAINTS.USER_NAME_MAX_LENGTH}자를 초과할 수 없습니다`);
  }

  // 회사 이름 길이 체크
  if (req.body.company_name && req.body.company_name.length > CONSTRAINTS.COMPANY_NAME_MAX_LENGTH) {
    errors.push(`회사 이름은 ${CONSTRAINTS.COMPANY_NAME_MAX_LENGTH}자를 초과할 수 없습니다`);
  }

  // 프로젝트 이름 길이 체크
  if (req.body.project_name && req.body.project_name.length > CONSTRAINTS.PROJECT_NAME_MAX_LENGTH) {
    errors.push(`프로젝트 이름은 ${CONSTRAINTS.PROJECT_NAME_MAX_LENGTH}자를 초과할 수 없습니다`);
  }

  // 작업 이름 길이 체크
  if (req.body.task_name && req.body.task_name.length > CONSTRAINTS.TASK_NAME_MAX_LENGTH) {
    errors.push(`작업 이름은 ${CONSTRAINTS.TASK_NAME_MAX_LENGTH}자를 초과할 수 없습니다`);
  }

  if (errors.length > 0) {
    throw new ValidationError(errors.join(', '));
  }

  next();
};