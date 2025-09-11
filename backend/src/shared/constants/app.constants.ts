/**
 * 애플리케이션 전체에서 사용되는 상수들
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// 사용자 역할 (Role IDs)
export const ROLE_IDS = {
  SYSTEM_ADMIN: 1,
  COMPANY_MANAGER: 2,
  TEAM_MEMBER: 3,
} as const;

// 사용자 상태 (Status IDs) 
export const STATUS_IDS = {
  ACTIVE: 1,
  INACTIVE: 2,
  PENDING: 3,
} as const;

// JWT 토큰 타입
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET: 'reset',
} as const;

// 토큰 만료 시간
export const TOKEN_EXPIRES = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '30d',
  RESET_TOKEN: '1h',
} as const;

// API 응답 메시지
export const RESPONSE_MESSAGES = {
  // 성공 메시지
  LOGIN_SUCCESS: '로그인이 성공했습니다.',
  LOGOUT_SUCCESS: '로그아웃이 성공했습니다.',
  SIGNUP_SUCCESS: '회원가입이 완료되었습니다. 승인을 기다려주세요.',
  SIGNUP_COMPANY_SUCCESS: '회사 관리자 가입이 완료되었습니다. 시스템 관리자의 승인을 기다려주세요.',
  SIGNUP_MEMBER_SUCCESS: '팀원 가입이 완료되었습니다. 회사 관리자의 승인을 기다려주세요.',
  PASSWORD_RESET_EMAIL_SENT: '비밀번호 재설정 이메일이 발송되었습니다.',
  PASSWORD_RESET_SUCCESS: '비밀번호가 성공적으로 재설정되었습니다.',
  COMPANY_APPROVED: '회사가 승인되었습니다.',
  COMPANY_REJECTED: '회사가 거부되었습니다.',
  MEMBER_APPROVED: '팀원이 승인되었습니다.',
  MEMBER_REJECTED: '팀원이 거부되었습니다.',
  
  // 에러 메시지
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  EMAIL_ALREADY_EXISTS: '이미 등록된 이메일입니다.',
  USER_NOT_FOUND: '사용자를 찾을 수 없습니다.',
  COMPANY_NOT_FOUND: '회사를 찾을 수 없습니다.',
  INVALID_INVITE_CODE: '유효하지 않은 초대 코드입니다.',
  ACCOUNT_PENDING: '계정 승인이 필요합니다.',
  ACCOUNT_INACTIVE: '비활성화된 계정입니다.',
  INSUFFICIENT_PERMISSIONS: '권한이 부족합니다.',
  TOKEN_EXPIRED: '토큰이 만료되었습니다.',
  TOKEN_INVALID: '유효하지 않은 토큰입니다.',
  INTERNAL_ERROR: '내부 서버 오류가 발생했습니다.',
} as const;

// 에러 코드
export const ERROR_CODES = {
  // 인증 에러
  AUTHENTICATION_FAILED: 'AUTHENTICATION_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // 검증 에러
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_INVITE_CODE: 'INVALID_INVITE_CODE',
  
  // 상태 에러
  ACCOUNT_PENDING: 'ACCOUNT_PENDING',
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  
  // 리소스 에러
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  COMPANY_NOT_FOUND: 'COMPANY_NOT_FOUND',
  
  // 시스템 에러
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// 로그 레벨
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn', 
  INFO: 'info',
  DEBUG: 'debug',
} as const;

// 캐시 키
export const CACHE_KEYS = {
  USER_PROFILE: 'user:profile:',
  TOKEN_BLACKLIST: 'token:blacklist:',
  COMPANY_DATA: 'company:',
  REFRESH_TOKEN: 'refresh:',
} as const;

// 캐시 TTL (초)
export const CACHE_TTL = {
  USER_PROFILE: 3600, // 1시간
  TOKEN_BLACKLIST: 900, // 15분
  COMPANY_DATA: 7200, // 2시간
  REFRESH_TOKEN: 2592000, // 30일
} as const;

// 파일 업로드
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  UPLOAD_PATH: './uploads/',
} as const;

// 페이지네이션
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Rate Limiting
export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15분
  MAX_REQUESTS: 100,
  SKIP_SUCCESSFUL_REQUESTS: false,
} as const;