import { ValidationChain } from 'express-validator';
import { BaseValidator } from '../base.validator';

/**
 * Auth 도메인 Validation Schemas
 * 인증 관련 모든 validation 스키마를 정의
 */
export class AuthSchemas {
  /**
   * 로그인 스키마
   */
  static get loginSchema(): ValidationChain[] {
    return [
      BaseValidator.emailRule('email'),
      BaseValidator.passwordRule('password')
    ];
  }

  /**
   * 회사 관리자 회원가입 스키마
   */
  static get companyManagerSignupSchema(): ValidationChain[] {
    return [
      // 사용자 정보
      BaseValidator.emailRule('user.email'),
      BaseValidator.passwordRule('user.password'),
      BaseValidator.nameRule('user.user_name'),
      BaseValidator.phoneRule('user.phone_number', true),
      
      // 회사 정보
      BaseValidator.nameRule('company.company_name'),
      BaseValidator.commentRule('company.company_description', true)
    ];
  }

  /**
   * 팀원 회원가입 스키마
   */
  static get teamMemberSignupSchema(): ValidationChain[] {
    return [
      // 사용자 정보
      BaseValidator.emailRule('user.email'),
      BaseValidator.passwordRule('user.password'),
      BaseValidator.nameRule('user.user_name'),
      BaseValidator.phoneRule('user.phone_number', true),
      
      // 초대 코드
      BaseValidator.tokenRule('invitation_code', 'body', false)
    ];
  }

  /**
   * 비밀번호 재설정 요청 스키마
   */
  static get forgotPasswordSchema(): ValidationChain[] {
    return [
      BaseValidator.emailRule('email')
    ];
  }

  /**
   * 비밀번호 재설정 토큰 검증 스키마
   */
  static get verifyResetTokenSchema(): ValidationChain[] {
    return [
      BaseValidator.tokenRule('token', 'query')
    ];
  }

  /**
   * 비밀번호 재설정 스키마
   */
  static get resetPasswordSchema(): ValidationChain[] {
    return [
      BaseValidator.tokenRule('token', 'body'),
      BaseValidator.passwordRule('new_password'),
      BaseValidator.passwordRule('confirm_password')
    ];
  }

  /**
   * 회사 승인 스키마
   */
  static get companyApprovalSchema(): ValidationChain[] {
    return [
      BaseValidator.uuidRule('company_id', 'body'),
      BaseValidator.actionRule('action', ['approve', 'reject']),
      BaseValidator.commentRule('comment', true),
      BaseValidator.booleanRule('generate_invitation_code', true)
    ];
  }

  /**
   * 멤버 승인 스키마
   */
  static get memberApprovalSchema(): ValidationChain[] {
    return [
      BaseValidator.uuidRule('user_id', 'body'),
      BaseValidator.actionRule('action', ['approve', 'reject']),
      BaseValidator.commentRule('comment', true)
    ];
  }
}