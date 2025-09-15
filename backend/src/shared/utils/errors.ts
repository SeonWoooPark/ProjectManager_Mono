export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    details?: any,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || 'API_ERROR';
    this.details = details;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, field?: string, reason?: string) {
    super(400, message, 'VALIDATION_ERROR', { field, reason });
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = '인증이 필요합니다', code: string = 'UNAUTHORIZED') {
    super(401, message, code);
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = '권한이 없습니다', code: string = 'FORBIDDEN') {
    super(403, message, code);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = '리소스를 찾을 수 없습니다', resource?: string) {
    super(404, message, 'NOT_FOUND', { resource });
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, field?: string) {
    super(409, message, 'CONFLICT', { field, reason: 'duplicate' });
  }
}

export class TokenExpiredError extends ApiError {
  constructor(tokenType: 'access' | 'refresh' | 'reset' = 'access') {
    const messages = {
      access: 'Access Token이 만료되었습니다',
      refresh: 'Refresh Token이 만료되었습니다',
      reset: '비밀번호 재설정 토큰이 만료되었습니다'
    };
    super(401, messages[tokenType], `${tokenType.toUpperCase()}_TOKEN_EXPIRED`);
  }
}

export class InvalidTokenError extends ApiError {
  constructor(tokenType: 'access' | 'refresh' | 'reset' = 'access') {
    const messages = {
      access: '유효하지 않은 Access Token입니다',
      refresh: '유효하지 않은 Refresh Token입니다',
      reset: '유효하지 않은 비밀번호 재설정 토큰입니다'
    };
    super(401, messages[tokenType], `INVALID_${tokenType.toUpperCase()}_TOKEN`);
  }
}

export class AccountStatusError extends ApiError {
  constructor(status: 'PENDING' | 'INACTIVE' | 'LOCKED' | 'NO_COMPANY' | 'COMPANY_INACTIVE' | 'COMPANY_PENDING') {
    const messages = {
      PENDING: '계정 승인을 기다리고 있습니다',
      INACTIVE: '비활성화된 계정입니다',
      LOCKED: '계정이 잠겨있습니다',
      NO_COMPANY: '소속된 회사가 없습니다',
      COMPANY_INACTIVE: '소속 회사가 비활성화되었습니다',
      COMPANY_PENDING: '소속 회사가 승인 대기 중입니다'
    };
    const codes = {
      PENDING: 'ACCOUNT_PENDING',
      INACTIVE: 'ACCOUNT_INACTIVE',
      LOCKED: 'ACCOUNT_LOCKED',
      NO_COMPANY: 'NO_COMPANY',
      COMPANY_INACTIVE: 'COMPANY_INACTIVE',
      COMPANY_PENDING: 'COMPANY_PENDING'
    };
    super(403, messages[status], codes[status], { status });
  }
}

export class RateLimitError extends ApiError {
  constructor(retryAfter?: number) {
    super(
      429,
      '너무 많은 요청입니다. 잠시 후 다시 시도해주세요',
      'TOO_MANY_REQUESTS',
      { retry_after: retryAfter }
    );
  }
}

export class TokenReuseError extends ApiError {
  constructor() {
    super(
      403,
      '보안 위협이 감지되어 모든 세션이 종료되었습니다',
      'TOKEN_REUSE_DETECTED'
    );
  }
}

export class PasswordPolicyError extends ApiError {
  constructor(errors: string[]) {
    super(
      400,
      '비밀번호 정책을 만족하지 않습니다',
      'PASSWORD_POLICY_VIOLATION',
      {
        requirements: [
          '최소 8자 이상',
          '대문자 포함',
          '소문자 포함',
          '숫자 포함',
          '특수문자 포함'
        ],
        errors
      }
    );
  }
}

export class PasswordMismatchError extends ApiError {
  constructor() {
    super(
      400,
      '비밀번호가 일치하지 않습니다',
      'PASSWORD_MISMATCH',
      { field: 'confirm_password', reason: 'mismatch' }
    );
  }
}

export class InvalidCredentialsError extends ApiError {
  constructor() {
    super(401, '이메일 또는 비밀번호가 일치하지 않습니다', 'INVALID_CREDENTIALS');
  }
}

export class InvalidInvitationError extends ApiError {
  constructor() {
    super(404, '유효하지 않은 초대 코드입니다', 'INVALID_INVITATION');
  }
}

export class TokenAlreadyUsedError extends ApiError {
  constructor() {
    super(410, '이미 사용된 토큰입니다', 'TOKEN_ALREADY_USED');
  }
}

// Database Constraint Errors
export class DatabaseConstraintError extends ApiError {
  constructor(message: string, constraint: string, details?: any) {
    super(400, message, 'DATABASE_CONSTRAINT_VIOLATION', { constraint, ...details });
  }
}

export class ForeignKeyViolationError extends DatabaseConstraintError {
  constructor(entity: string, field: string, referencedEntity: string) {
    super(
      `${entity}의 ${field}에 대한 참조가 유효하지 않습니다. ${referencedEntity}가 존재하지 않습니다`,
      'FOREIGN_KEY_VIOLATION',
      { entity, field, referencedEntity }
    );
  }
}

export class UniqueConstraintViolationError extends DatabaseConstraintError {
  constructor(entity: string, field: string, value?: string) {
    super(
      `${entity}의 ${field}이(가) 이미 존재합니다`,
      'UNIQUE_CONSTRAINT_VIOLATION',
      { entity, field, value }
    );
  }
}

export class CheckConstraintViolationError extends DatabaseConstraintError {
  constructor(entity: string, constraint: string, message: string) {
    super(
      message,
      'CHECK_CONSTRAINT_VIOLATION',
      { entity, constraint }
    );
  }
}

export class InvalidIdFormatError extends DatabaseConstraintError {
  constructor(entity: string, idType: string, pattern: string) {
    super(
      `잘못된 ${entity} ID 형식입니다. ${pattern} 형식이어야 합니다`,
      'INVALID_ID_FORMAT',
      { entity, idType, pattern }
    );
  }
}

export class DataLengthExceededError extends DatabaseConstraintError {
  constructor(entity: string, field: string, maxLength: number) {
    super(
      `${entity}의 ${field}이(가) 최대 길이 ${maxLength}자를 초과했습니다`,
      'DATA_LENGTH_EXCEEDED',
      { entity, field, maxLength }
    );
  }
}

export class InvalidRangeError extends DatabaseConstraintError {
  constructor(entity: string, field: string, min: number, max: number) {
    super(
      `${entity}의 ${field} 값은 ${min}에서 ${max} 사이여야 합니다`,
      'INVALID_RANGE',
      { entity, field, min, max }
    );
  }
}

export class InvalidDateRangeError extends DatabaseConstraintError {
  constructor(entity: string, message?: string) {
    super(
      message || `${entity}의 종료일은 시작일보다 이후여야 합니다`,
      'INVALID_DATE_RANGE',
      { entity }
    );
  }
}

export class InvalidEnumValueError extends DatabaseConstraintError {
  constructor(entity: string, field: string, validValues: string[]) {
    super(
      `${entity}의 ${field} 값은 다음 중 하나여야 합니다: ${validValues.join(', ')}`,
      'INVALID_ENUM_VALUE',
      { entity, field, validValues }
    );
  }
}

export class NotNullViolationError extends DatabaseConstraintError {
  constructor(entity: string, field: string) {
    super(
      `${entity}의 ${field}은(는) 필수 항목입니다`,
      'NOT_NULL_VIOLATION',
      { entity, field }
    );
  }
}

export class CascadeDeleteRestrictedError extends DatabaseConstraintError {
  constructor(entity: string, dependentEntity: string) {
    super(
      `${entity}을(를) 삭제할 수 없습니다. ${dependentEntity}에서 참조하고 있습니다`,
      'CASCADE_DELETE_RESTRICTED',
      { entity, dependentEntity }
    );
  }
}