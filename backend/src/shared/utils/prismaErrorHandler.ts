import { Prisma } from '@prisma/client';
import {
  UniqueConstraintViolationError,
  ForeignKeyViolationError,
  NotNullViolationError,
  CheckConstraintViolationError,
  CascadeDeleteRestrictedError,
  DatabaseConstraintError,
} from './errors';

/**
 * Prisma 에러를 커스텀 에러로 변환하는 핸들러
 */
export function handlePrismaError(error: any): never {
  // Prisma 에러가 아닌 경우 그대로 throw
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    throw error;
  }

  switch (error.code) {
    case 'P2002': // Unique constraint violation
      const uniqueField = (error.meta?.target as string[])?.join(', ') || 'unknown';
      throw new UniqueConstraintViolationError('데이터', uniqueField);

    case 'P2003': // Foreign key constraint violation
      const fkField = error.meta?.field_name as string || 'unknown';
      const modelName = error.meta?.modelName as string || '데이터';
      throw new ForeignKeyViolationError(modelName, fkField, '참조 데이터');

    case 'P2011': // Null constraint violation
      const nullField = error.meta?.constraint as string[] || ['unknown'];
      throw new NotNullViolationError('데이터', nullField[0]);

    case 'P2012': // Missing required value
      const missingField = error.meta?.constraint as string || 'unknown';
      throw new NotNullViolationError('데이터', missingField);

    case 'P2014': // Relation violation (cascade delete restricted)
      const relation = error.meta?.relation_name as string || 'unknown';
      const modelNames = error.meta?.model_a_name as string || '데이터';
      throw new CascadeDeleteRestrictedError(modelNames, relation);

    case 'P2025': // Record not found
      throw new DatabaseConstraintError(
        '요청한 데이터를 찾을 수 없습니다',
        'RECORD_NOT_FOUND'
      );

    case 'P2000': // Value too long for column
      const column = error.meta?.column_name as string || 'unknown';
      throw new DatabaseConstraintError(
        `${column} 필드의 값이 너무 깁니다`,
        'VALUE_TOO_LONG',
        { field: column }
      );

    case 'P2006': // Invalid value for field
      const field = error.meta?.field_name as string || 'unknown';
      throw new CheckConstraintViolationError(
        '데이터',
        field,
        `${field} 필드의 값이 유효하지 않습니다`
      );

    case 'P2021': // Table doesn't exist
      throw new DatabaseConstraintError(
        '테이블이 존재하지 않습니다',
        'TABLE_NOT_FOUND'
      );

    case 'P2022': // Column doesn't exist
      throw new DatabaseConstraintError(
        '컬럼이 존재하지 않습니다',
        'COLUMN_NOT_FOUND'
      );

    default:
      // 기타 Prisma 에러
      throw new DatabaseConstraintError(
        error.message || '데이터베이스 작업 중 오류가 발생했습니다',
        `PRISMA_ERROR_${error.code}`,
        { originalError: error.message }
      );
  }
}

/**
 * Prisma 트랜잭션 에러 처리
 */
export function handlePrismaTransactionError(error: any): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new DatabaseConstraintError(
      '데이터베이스 연결에 실패했습니다',
      'DB_CONNECTION_FAILED'
    );
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    throw new DatabaseConstraintError(
      '데이터베이스 엔진 오류가 발생했습니다',
      'DB_ENGINE_ERROR'
    );
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new DatabaseConstraintError(
      '알 수 없는 데이터베이스 오류가 발생했습니다',
      'UNKNOWN_DB_ERROR'
    );
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    throw new DatabaseConstraintError(
      '데이터 검증에 실패했습니다',
      'VALIDATION_ERROR',
      { details: error.message }
    );
  }

  // 그 외의 에러는 그대로 throw
  throw error;
}

/**
 * 안전한 Prisma 작업 실행 래퍼
 */
export async function executePrismaOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handlePrismaTransactionError(error);
  }
}

/**
 * Check constraint 에러 상세 메시지 매핑
 */
const CHECK_CONSTRAINT_MESSAGES: Record<string, string> = {
  'chk_user_id_format': '사용자 ID는 usr_로 시작하고 6자 이상의 영숫자여야 합니다',
  'chk_company_id_format': '회사 ID는 cmp_로 시작하고 6자 이상의 영숫자여야 합니다',
  'chk_project_id_format': '프로젝트 ID는 prj_로 시작하고 6자 이상의 영숫자여야 합니다',
  'chk_task_id_format': '작업 ID는 tsk_로 시작하고 6자 이상의 영숫자여야 합니다',
  'chk_invitation_code_format': '초대 코드는 INV-로 시작하고 6자 이상의 대문자/숫자여야 합니다',
  'chk_progress_rate': '진행률은 0에서 100 사이여야 합니다',
  'chk_date_validation': '종료일은 시작일보다 이후여야 합니다',
  'chk_expires_after_created': '만료 시간은 생성 시간보다 이후여야 합니다',
  'chk_phone_format': '전화번호 형식이 올바르지 않습니다',
  'chk_ip_format': 'IP 주소 형식이 올바르지 않습니다',
  'chk_password_hash_length': '비밀번호 해시가 올바르지 않습니다',
  'chk_token_hash_length': '토큰 해시가 올바르지 않습니다',
  'chk_jti_length': 'JTI가 올바르지 않습니다',
  'chk_token_family_length': '토큰 패밀리가 올바르지 않습니다',
  'chk_token_type': '토큰 타입은 access, refresh, reset 중 하나여야 합니다',
  'chk_revoked_reason': '취소 사유가 올바르지 않습니다',
  'chk_blacklist_reason': '블랙리스트 사유가 올바르지 않습니다',
  'chk_role_id': '역할 ID가 올바르지 않습니다',
  'chk_user_status_id': '사용자 상태 ID가 올바르지 않습니다',
  'chk_company_status_id': '회사 상태 ID가 올바르지 않습니다',
  'chk_project_status_id': '프로젝트 상태 ID가 올바르지 않습니다',
  'chk_task_status_id': '작업 상태 ID가 올바르지 않습니다',
};

/**
 * PostgreSQL 에러 메시지에서 constraint 이름 추출
 */
export function extractConstraintName(message: string): string | null {
  // Pattern: violates check constraint "constraint_name"
  const match = message.match(/violates check constraint "([^"]+)"/);
  return match ? match[1] : null;
}

/**
 * Check constraint 에러를 상세 메시지로 변환
 */
export function getCheckConstraintMessage(constraintName: string): string {
  return CHECK_CONSTRAINT_MESSAGES[constraintName] || 
    `체크 제약조건 ${constraintName}을 위반했습니다`;
}