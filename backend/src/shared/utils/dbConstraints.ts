/**
 * Database Constraint Validator
 * 데이터베이스 제약조건을 검증하는 유틸리티
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * ID 형식 패턴
 * 데이터베이스 체크 제약조건에 정의된 패턴
 */
export const ID_PATTERNS = {
  USER: /^usr_[a-zA-Z0-9]{6,}$/,
  COMPANY: /^cmp_[a-zA-Z0-9]{6,}$/,
  PROJECT: /^prj_[a-zA-Z0-9]{6,}$/,
  TASK: /^tsk_[a-zA-Z0-9]{6,}$/,
  ACTIVITY_LOG: /^log_[a-zA-Z0-9]{6,}$/,
  ALLOCATE: /^alc_[a-zA-Z0-9]{6,}$/,
  REVIEW: /^rev_[a-zA-Z0-9]{6,}$/,
  REFRESH_TOKEN: /^rft_[a-zA-Z0-9]{6,}$/,
  PASSWORD_RESET_TOKEN: /^prt_[a-zA-Z0-9]{6,}$/,
  TOKEN_BLACKLIST: /^blk_[a-zA-Z0-9]{6,}$/,
  INVITATION_CODE: /^INV-[A-Z0-9]{6,}$/,
};

/**
 * 상태 값 범위
 */
export const STATUS_RANGES = {
  USER_STATUS: { min: 1, max: null }, // 1 이상
  COMPANY_STATUS: { min: 1, max: null }, // 1 이상
  PROJECT_STATUS: { min: 1, max: 5 }, // 1-5
  TASK_STATUS: { min: 1, max: 5 }, // 1-5
  ROLE: [1, 2, 3], // 특정 값만 허용
};

/**
 * 기타 제약조건
 */
export const CONSTRAINTS = {
  PROGRESS_RATE: { min: 0, max: 100 },
  PASSWORD_HASH_MIN_LENGTH: 60,
  TOKEN_HASH_MIN_LENGTH: 64,
  JTI_MIN_LENGTH: 20,
  TOKEN_FAMILY_MIN_LENGTH: 20,
  EMAIL_MAX_LENGTH: 255,
  USER_NAME_MAX_LENGTH: 100,
  COMPANY_NAME_MAX_LENGTH: 200,
  PROJECT_NAME_MAX_LENGTH: 200,
  TASK_NAME_MAX_LENGTH: 200,
  PHONE_NUMBER_MAX_LENGTH: 20,
  INVITATION_CODE_MAX_LENGTH: 20,
  COMPANY_DESCRIPTION_MAX_LENGTH: 1000,
  PROJECT_DESCRIPTION_MAX_LENGTH: 2000,
  TASK_DESCRIPTION_MAX_LENGTH: 2000,
  COMMENT_MAX_LENGTH: 1000,
};

/**
 * 토큰 타입
 */
export const VALID_TOKEN_TYPES = ['access', 'refresh', 'reset'];

/**
 * 취소 사유
 */
export const REVOKED_REASONS = [
  'logout',
  'token_rotation',
  'suspicious_activity',
  'password_change',
  'admin_action',
];

export const BLACKLIST_REASONS = [
  'logout',
  'force_logout',
  'password_change',
  'suspicious_activity',
  'admin_action',
];

/**
 * ID 형식 검증 클래스
 */
export class IdValidator {
  static validateUserId(id: string | null | undefined): ValidationResult {
    if (!id) {
      return { valid: false, errors: ['사용자 ID가 필요합니다'] };
    }
    if (!ID_PATTERNS.USER.test(id)) {
      return {
        valid: false,
        errors: ['사용자 ID 형식이 올바르지 않습니다 (usr_로 시작하고 6자 이상의 영숫자)'],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateCompanyId(id: string | null | undefined): ValidationResult {
    if (!id) {
      return { valid: false, errors: ['회사 ID가 필요합니다'] };
    }
    if (!ID_PATTERNS.COMPANY.test(id)) {
      return {
        valid: false,
        errors: ['회사 ID 형식이 올바르지 않습니다 (cmp_로 시작하고 6자 이상의 영숫자)'],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateProjectId(id: string | null | undefined): ValidationResult {
    if (!id) {
      return { valid: false, errors: ['프로젝트 ID가 필요합니다'] };
    }
    if (!ID_PATTERNS.PROJECT.test(id)) {
      return {
        valid: false,
        errors: ['프로젝트 ID 형식이 올바르지 않습니다 (prj_로 시작하고 6자 이상의 영숫자)'],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateTaskId(id: string | null | undefined): ValidationResult {
    if (!id) {
      return { valid: false, errors: ['작업 ID가 필요합니다'] };
    }
    if (!ID_PATTERNS.TASK.test(id)) {
      return {
        valid: false,
        errors: ['작업 ID 형식이 올바르지 않습니다 (tsk_로 시작하고 6자 이상의 영숫자)'],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateInvitationCode(code: string | null | undefined): ValidationResult {
    if (!code) {
      return { valid: true, errors: [] }; // 초대 코드는 선택사항
    }
    if (!ID_PATTERNS.INVITATION_CODE.test(code)) {
      return {
        valid: false,
        errors: ['초대 코드 형식이 올바르지 않습니다 (INV-로 시작하고 6자 이상의 대문자/숫자)'],
      };
    }
    return { valid: true, errors: [] };
  }

  /**
   * ID 생성 헬퍼
   */
  static generateId(type: keyof typeof ID_PATTERNS): string {
    const crypto = require('crypto');
    const randomString = crypto.randomBytes(6).toString('hex');
    
    switch (type) {
      case 'USER':
        return `usr_${randomString}`;
      case 'COMPANY':
        return `cmp_${randomString}`;
      case 'PROJECT':
        return `prj_${randomString}`;
      case 'TASK':
        return `tsk_${randomString}`;
      case 'ACTIVITY_LOG':
        return `log_${randomString}`;
      case 'ALLOCATE':
        return `alc_${randomString}`;
      case 'REVIEW':
        return `rev_${randomString}`;
      case 'REFRESH_TOKEN':
        return `rft_${randomString}`;
      case 'PASSWORD_RESET_TOKEN':
        return `prt_${randomString}`;
      case 'TOKEN_BLACKLIST':
        return `blk_${randomString}`;
      case 'INVITATION_CODE':
        return `INV-${randomString.toUpperCase()}`;
      default:
        throw new Error(`Unknown ID type: ${type}`);
    }
  }
}

/**
 * 범위 검증 클래스
 */
export class RangeValidator {
  static validateProgressRate(rate: number | null | undefined): ValidationResult {
    if (rate === null || rate === undefined) {
      return { valid: true, errors: [] }; // 진행률은 선택사항
    }
    if (rate < CONSTRAINTS.PROGRESS_RATE.min || rate > CONSTRAINTS.PROGRESS_RATE.max) {
      return {
        valid: false,
        errors: [`진행률은 ${CONSTRAINTS.PROGRESS_RATE.min}에서 ${CONSTRAINTS.PROGRESS_RATE.max} 사이여야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateRoleId(roleId: number): ValidationResult {
    if (!STATUS_RANGES.ROLE.includes(roleId)) {
      return {
        valid: false,
        errors: [`역할 ID는 ${STATUS_RANGES.ROLE.join(', ')} 중 하나여야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateUserStatusId(statusId: number): ValidationResult {
    if (statusId < STATUS_RANGES.USER_STATUS.min) {
      return {
        valid: false,
        errors: [`사용자 상태 ID는 ${STATUS_RANGES.USER_STATUS.min} 이상이어야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateProjectStatusId(statusId: number): ValidationResult {
    if (statusId < STATUS_RANGES.PROJECT_STATUS.min || statusId > STATUS_RANGES.PROJECT_STATUS.max) {
      return {
        valid: false,
        errors: [`프로젝트 상태 ID는 ${STATUS_RANGES.PROJECT_STATUS.min}에서 ${STATUS_RANGES.PROJECT_STATUS.max} 사이여야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateTaskStatusId(statusId: number): ValidationResult {
    if (statusId < STATUS_RANGES.TASK_STATUS.min || statusId > STATUS_RANGES.TASK_STATUS.max) {
      return {
        valid: false,
        errors: [`작업 상태 ID는 ${STATUS_RANGES.TASK_STATUS.min}에서 ${STATUS_RANGES.TASK_STATUS.max} 사이여야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }
}

/**
 * 날짜 검증 클래스
 */
export class DateValidator {
  static validateDateRange(startDate: Date | string | null, endDate: Date | string | null): ValidationResult {
    if (!startDate || !endDate) {
      return { valid: true, errors: [] }; // 날짜가 없으면 검증 스킵
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return {
        valid: false,
        errors: ['종료일은 시작일보다 이후여야 합니다'],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateExpiresAfterCreated(createdAt: Date | string, expiresAt: Date | string): ValidationResult {
    const created = new Date(createdAt);
    const expires = new Date(expiresAt);

    if (expires <= created) {
      return {
        valid: false,
        errors: ['만료 시간은 생성 시간보다 이후여야 합니다'],
      };
    }
    return { valid: true, errors: [] };
  }
}

/**
 * 문자열 길이 검증 클래스
 */
export class LengthValidator {
  static validateEmail(email: string): ValidationResult {
    if (!email) {
      return { valid: false, errors: ['이메일이 필요합니다'] };
    }
    if (email.length > CONSTRAINTS.EMAIL_MAX_LENGTH) {
      return {
        valid: false,
        errors: [`이메일은 ${CONSTRAINTS.EMAIL_MAX_LENGTH}자를 초과할 수 없습니다`],
      };
    }
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        errors: ['올바른 이메일 형식이 아닙니다'],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateUserName(name: string): ValidationResult {
    if (!name) {
      return { valid: false, errors: ['사용자 이름이 필요합니다'] };
    }
    if (name.length > CONSTRAINTS.USER_NAME_MAX_LENGTH) {
      return {
        valid: false,
        errors: [`사용자 이름은 ${CONSTRAINTS.USER_NAME_MAX_LENGTH}자를 초과할 수 없습니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateCompanyName(name: string): ValidationResult {
    if (!name) {
      return { valid: false, errors: ['회사 이름이 필요합니다'] };
    }
    if (name.length > CONSTRAINTS.COMPANY_NAME_MAX_LENGTH) {
      return {
        valid: false,
        errors: [`회사 이름은 ${CONSTRAINTS.COMPANY_NAME_MAX_LENGTH}자를 초과할 수 없습니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateProjectName(name: string): ValidationResult {
    if (!name) {
      return { valid: false, errors: ['프로젝트 이름이 필요합니다'] };
    }
    if (name.length > CONSTRAINTS.PROJECT_NAME_MAX_LENGTH) {
      return {
        valid: false,
        errors: [`프로젝트 이름은 ${CONSTRAINTS.PROJECT_NAME_MAX_LENGTH}자를 초과할 수 없습니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateTaskName(name: string): ValidationResult {
    if (!name) {
      return { valid: false, errors: ['작업 이름이 필요합니다'] };
    }
    if (name.length > CONSTRAINTS.TASK_NAME_MAX_LENGTH) {
      return {
        valid: false,
        errors: [`작업 이름은 ${CONSTRAINTS.TASK_NAME_MAX_LENGTH}자를 초과할 수 없습니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validatePhoneNumber(phone: string | null | undefined): ValidationResult {
    if (!phone) {
      return { valid: true, errors: [] }; // 전화번호는 선택사항
    }
    if (phone.length > CONSTRAINTS.PHONE_NUMBER_MAX_LENGTH) {
      return {
        valid: false,
        errors: [`전화번호는 ${CONSTRAINTS.PHONE_NUMBER_MAX_LENGTH}자를 초과할 수 없습니다`],
      };
    }
    // 전화번호 형식 검증
    const phoneRegex = /^[0-9+\-\s()]+$/;
    if (!phoneRegex.test(phone)) {
      return {
        valid: false,
        errors: ['전화번호는 숫자, +, -, 공백, 괄호만 포함할 수 있습니다'],
      };
    }
    return { valid: true, errors: [] };
  }

  static validatePasswordHash(hash: string): ValidationResult {
    if (!hash) {
      return { valid: false, errors: ['비밀번호 해시가 필요합니다'] };
    }
    if (hash.length < CONSTRAINTS.PASSWORD_HASH_MIN_LENGTH) {
      return {
        valid: false,
        errors: [`비밀번호 해시는 최소 ${CONSTRAINTS.PASSWORD_HASH_MIN_LENGTH}자 이상이어야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateTokenHash(hash: string): ValidationResult {
    if (!hash) {
      return { valid: false, errors: ['토큰 해시가 필요합니다'] };
    }
    if (hash.length < CONSTRAINTS.TOKEN_HASH_MIN_LENGTH) {
      return {
        valid: false,
        errors: [`토큰 해시는 최소 ${CONSTRAINTS.TOKEN_HASH_MIN_LENGTH}자 이상이어야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateJti(jti: string): ValidationResult {
    if (!jti) {
      return { valid: false, errors: ['JTI가 필요합니다'] };
    }
    if (jti.length < CONSTRAINTS.JTI_MIN_LENGTH) {
      return {
        valid: false,
        errors: [`JTI는 최소 ${CONSTRAINTS.JTI_MIN_LENGTH}자 이상이어야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateTokenFamily(family: string): ValidationResult {
    if (!family) {
      return { valid: false, errors: ['토큰 패밀리가 필요합니다'] };
    }
    if (family.length < CONSTRAINTS.TOKEN_FAMILY_MIN_LENGTH) {
      return {
        valid: false,
        errors: [`토큰 패밀리는 최소 ${CONSTRAINTS.TOKEN_FAMILY_MIN_LENGTH}자 이상이어야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateDescription(description: string | null | undefined, type: 'company' | 'project' | 'task'): ValidationResult {
    if (!description) {
      return { valid: true, errors: [] }; // 설명은 선택사항
    }
    
    let maxLength: number;
    let entityName: string;
    
    switch (type) {
      case 'company':
        maxLength = CONSTRAINTS.COMPANY_DESCRIPTION_MAX_LENGTH;
        entityName = '회사 설명';
        break;
      case 'project':
        maxLength = CONSTRAINTS.PROJECT_DESCRIPTION_MAX_LENGTH;
        entityName = '프로젝트 설명';
        break;
      case 'task':
        maxLength = CONSTRAINTS.TASK_DESCRIPTION_MAX_LENGTH;
        entityName = '작업 설명';
        break;
    }
    
    if (description.length > maxLength) {
      return {
        valid: false,
        errors: [`${entityName}은 ${maxLength}자를 초과할 수 없습니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateComment(comment: string | null | undefined): ValidationResult {
    if (!comment) {
      return { valid: true, errors: [] }; // 코멘트는 선택사항
    }
    if (comment.length > CONSTRAINTS.COMMENT_MAX_LENGTH) {
      return {
        valid: false,
        errors: [`코멘트는 ${CONSTRAINTS.COMMENT_MAX_LENGTH}자를 초과할 수 없습니다`],
      };
    }
    return { valid: true, errors: [] };
  }
}

/**
 * IP 주소 검증 클래스
 */
export class IpValidator {
  static validateIpAddress(ip: string | null | undefined): ValidationResult {
    if (!ip) {
      return { valid: true, errors: [] }; // IP는 선택사항
    }
    
    // IPv4 패턴
    const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    // IPv6 패턴 (간단한 버전)
    const ipv6Regex = /^(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}$/;
    
    if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
      return {
        valid: false,
        errors: ['올바른 IP 주소 형식이 아닙니다 (IPv4 또는 IPv6)'],
      };
    }
    return { valid: true, errors: [] };
  }
}

/**
 * 열거형 검증 클래스
 */
export class EnumValidator {
  static validateTokenType(type: string): ValidationResult {
    if (!VALID_TOKEN_TYPES.includes(type)) {
      return {
        valid: false,
        errors: [`토큰 타입은 ${VALID_TOKEN_TYPES.join(', ')} 중 하나여야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateRevokedReason(reason: string | null | undefined): ValidationResult {
    if (!reason) {
      return { valid: true, errors: [] }; // 취소 사유는 선택사항
    }
    if (!REVOKED_REASONS.includes(reason)) {
      return {
        valid: false,
        errors: [`취소 사유는 ${REVOKED_REASONS.join(', ')} 중 하나여야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }

  static validateBlacklistReason(reason: string | null | undefined): ValidationResult {
    if (!reason) {
      return { valid: true, errors: [] }; // 블랙리스트 사유는 선택사항
    }
    if (!BLACKLIST_REASONS.includes(reason)) {
      return {
        valid: false,
        errors: [`블랙리스트 사유는 ${BLACKLIST_REASONS.join(', ')} 중 하나여야 합니다`],
      };
    }
    return { valid: true, errors: [] };
  }
}

/**
 * 종합 검증 헬퍼
 */
export class DbConstraintValidator {
  /**
   * 여러 검증 결과를 하나로 병합
   */
  static mergeResults(...results: ValidationResult[]): ValidationResult {
    const errors: string[] = [];
    let valid = true;

    for (const result of results) {
      if (!result.valid) {
        valid = false;
        errors.push(...result.errors);
      }
    }

    return { valid, errors };
  }

  /**
   * 사용자 생성 시 필요한 모든 제약조건 검증
   */
  static validateUserCreation(data: {
    email: string;
    user_name: string;
    phone_number?: string;
    role_id: number;
    status_id: number;
    company_id?: string;
  }): ValidationResult {
    return this.mergeResults(
      LengthValidator.validateEmail(data.email),
      LengthValidator.validateUserName(data.user_name),
      LengthValidator.validatePhoneNumber(data.phone_number),
      RangeValidator.validateRoleId(data.role_id),
      RangeValidator.validateUserStatusId(data.status_id),
      data.company_id ? IdValidator.validateCompanyId(data.company_id) : { valid: true, errors: [] }
    );
  }

  /**
   * 회사 생성 시 필요한 모든 제약조건 검증
   */
  static validateCompanyCreation(data: {
    company_name: string;
    company_description?: string;
    manager_id?: string;
    invitation_code?: string;
    status_id: number;
  }): ValidationResult {
    return this.mergeResults(
      LengthValidator.validateCompanyName(data.company_name),
      LengthValidator.validateDescription(data.company_description, 'company'),
      data.manager_id ? IdValidator.validateUserId(data.manager_id) : { valid: true, errors: [] },
      IdValidator.validateInvitationCode(data.invitation_code),
      RangeValidator.validateUserStatusId(data.status_id)
    );
  }

  /**
   * 프로젝트 생성 시 필요한 모든 제약조건 검증
   */
  static validateProjectCreation(data: {
    project_name: string;
    project_description?: string;
    start_date: Date | string;
    end_date: Date | string;
    company_id: string;
    progress_rate?: number;
    status_id?: number;
  }): ValidationResult {
    return this.mergeResults(
      LengthValidator.validateProjectName(data.project_name),
      LengthValidator.validateDescription(data.project_description, 'project'),
      DateValidator.validateDateRange(data.start_date, data.end_date),
      IdValidator.validateCompanyId(data.company_id),
      RangeValidator.validateProgressRate(data.progress_rate),
      data.status_id ? RangeValidator.validateProjectStatusId(data.status_id) : { valid: true, errors: [] }
    );
  }

  /**
   * 작업 생성 시 필요한 모든 제약조건 검증
   */
  static validateTaskCreation(data: {
    task_name: string;
    task_description?: string;
    project_id: string;
    assignee_id?: string;
    status_id?: number;
    start_date?: Date | string;
    end_date?: Date | string;
    progress_rate?: number;
  }): ValidationResult {
    return this.mergeResults(
      LengthValidator.validateTaskName(data.task_name),
      LengthValidator.validateDescription(data.task_description, 'task'),
      IdValidator.validateProjectId(data.project_id),
      data.assignee_id ? IdValidator.validateUserId(data.assignee_id) : { valid: true, errors: [] },
      data.status_id ? RangeValidator.validateTaskStatusId(data.status_id) : { valid: true, errors: [] },
      DateValidator.validateDateRange(data.start_date || null, data.end_date || null),
      RangeValidator.validateProgressRate(data.progress_rate)
    );
  }
}