import { Request, Response, NextFunction } from 'express';
import { BaseValidator } from './base.validator';
import { AuthSchemas } from './schemas/auth.schema';
import { ValidationError } from '../../../shared/utils/errors';

/**
 * Auth Validator 클래스
 * 인증 관련 validation 로직을 래핑하고 미들웨어를 제공
 */
export class AuthValidator {
  /**
   * 로그인 validation 미들웨어
   */
  static validateLogin() {
    return BaseValidator.validate(AuthSchemas.loginSchema);
  }

  /**
   * 회사 관리자 회원가입 validation 미들웨어
   */
  static validateCompanyManagerSignup() {
    return BaseValidator.validate(AuthSchemas.companyManagerSignupSchema);
  }

  /**
   * 팀원 회원가입 validation 미들웨어
   */
  static validateTeamMemberSignup() {
    return BaseValidator.validate(AuthSchemas.teamMemberSignupSchema);
  }

  /**
   * 비밀번호 재설정 요청 validation 미들웨어
   */
  static validateForgotPassword() {
    return BaseValidator.validate(AuthSchemas.forgotPasswordSchema);
  }

  /**
   * 비밀번호 재설정 토큰 검증 validation 미들웨어
   */
  static validateVerifyResetToken() {
    return BaseValidator.validate(AuthSchemas.verifyResetTokenSchema);
  }

  /**
   * 비밀번호 재설정 validation 미들웨어
   */
  static validateResetPassword() {
    return [
      BaseValidator.validate(AuthSchemas.resetPasswordSchema),
      AuthValidator.validatePasswordConfirmation()
    ];
  }

  /**
   * 회사 승인 validation 미들웨어
   */
  static validateCompanyApproval() {
    return BaseValidator.validate(AuthSchemas.companyApprovalSchema);
  }

  /**
   * 멤버 승인 validation 미들웨어
   */
  static validateMemberApproval() {
    return BaseValidator.validate(AuthSchemas.memberApprovalSchema);
  }

  /**
   * 비밀번호 확인 검증 (커스텀 미들웨어)
   */
  private static validatePasswordConfirmation() {
    return (req: Request, _res: Response, next: NextFunction) => {
      const { new_password, confirm_password } = req.body;
      
      if (new_password !== confirm_password) {
        // ValidationError는 이미 상단에서 import됨
        return next(new ValidationError('비밀번호와 비밀번호 확인이 일치하지 않습니다'));
      }
      
      next();
    };
  }

  /**
   * 다국어 메시지 지원을 위한 에러 포매터
   * @param lang 언어 코드 (ko, en)
   */
  static formatErrorMessage(message: string, lang: string = 'ko'): string {
    const messages: Record<string, Record<string, string>> = {
      ko: {
        'Invalid email': '유효한 이메일을 입력해주세요',
        'Password required': '비밀번호를 입력해주세요',
        'Name required': '이름을 입력해주세요',
        'Token required': '토큰이 필요합니다',
        'Invalid action': '유효한 액션을 선택해주세요'
      },
      en: {
        '유효한 이메일을 입력해주세요': 'Please enter a valid email address',
        '비밀번호를 입력해주세요': 'Password is required',
        '이름을 입력해주세요': 'Name is required',
        '토큰이 필요합니다': 'Token is required',
        '유효한 액션을 선택해주세요': 'Please select a valid action'
      }
    };

    if (lang === 'en' && messages.en && messages.en[message]) {
      return messages.en[message];
    }
    
    if (lang === 'ko' && messages.ko && messages.ko[message]) {
      return messages.ko[message];
    }

    return message;
  }
}