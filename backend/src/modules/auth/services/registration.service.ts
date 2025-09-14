import { injectable, inject } from 'tsyringe';
import {
  CompanyManagerSignupRequestDto,
  TeamMemberSignupRequestDto,
} from '../dto/request';
import {
  UserStatus,
  UserRole,
  CompanyStatus,
} from '../interfaces/auth.types';
import {
  ConflictError,
  InvalidInvitationError,
  ValidationError,
  PasswordPolicyError,
} from '@shared/utils/errors';
import {
  IdValidator,
  DbConstraintValidator,
} from '@shared/utils/dbConstraints';
import { UserRepository } from '@modules/auth/repositories/user.repository';
import { CompanyRepository } from '@modules/auth/repositories/company.repository';
import { PasswordService } from './password.service';
import { prisma } from '@infrastructure/database/prisma.service';

@injectable()
export class RegistrationService {
  constructor(
    @inject('UserRepository') private userRepository: UserRepository,
    @inject('CompanyRepository') private companyRepository: CompanyRepository,
    @inject('PasswordService') private passwordService: PasswordService
  ) {}

  /**
   * Register company manager with new company
   */
  async registerCompanyManager(dto: CompanyManagerSignupRequestDto) {
    const { user, company } = dto;

    // Validate password policy
    const passwordValidation = this.passwordService.validatePasswordStrength(user.password);
    if (!passwordValidation.valid) {
      throw new PasswordPolicyError(passwordValidation.errors);
    }

    // Check email uniqueness
    await this.validateEmailUniqueness(user.email);

    // Check company name uniqueness
    await this.validateCompanyNameUniqueness(company.company_name);

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(user.password);

    // Validate database constraints
    this.validateUserConstraints({
      email: user.email,
      user_name: user.user_name,
      phone_number: user.phone_number,
      role_id: UserRole.COMPANY_MANAGER,
      status_id: UserStatus.PENDING,
    });

    this.validateCompanyConstraints({
      company_name: company.company_name,
      company_description: company.company_description,
      status_id: CompanyStatus.PENDING,
    });

    // Create user and company
    const result = await this.createCompanyWithManager(
      {
        email: user.email,
        password_hash: passwordHash,
        user_name: user.user_name,
        phone_number: user.phone_number,
        role_id: UserRole.COMPANY_MANAGER,
        status_id: UserStatus.PENDING,
      },
      {
        company_name: company.company_name,
        company_description: company.company_description,
        status_id: CompanyStatus.PENDING,
      }
    );

    // Get role and status names
    const role = await prisma.role.findUnique({ where: { id: result.user.role_id } });
    const userStatus = await prisma.userStatus.findUnique({ where: { id: result.user.status_id } });
    const companyStatus = await prisma.companyStatus.findUnique({
      where: { id: result.company!.status_id },
    });

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        user_name: result.user.user_name,
        role_id: result.user.role_id,
        role_name: role?.role_name || 'COMPANY_MANAGER',
        status_id: result.user.status_id,
        status_name: userStatus?.status_name || 'PENDING',
      },
      company: {
        id: result.company!.id,
        company_name: result.company!.company_name,
        status_id: result.company!.status_id,
        status_name: companyStatus?.status_name || 'PENDING',
        invitation_code: null,
      },
      message: '회원가입이 완료되었습니다. 시스템 관리자의 승인을 기다려주세요.',
    };
  }

  /**
   * Register team member with invitation code
   */
  async registerTeamMember(dto: TeamMemberSignupRequestDto) {
    const { user, invitation_code } = dto;
    const { email, password, user_name, phone_number } = user;

    // Validate password policy
    const passwordValidation = this.passwordService.validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new PasswordPolicyError(passwordValidation.errors);
    }

    // Check email uniqueness
    await this.validateEmailUniqueness(email);

    // Validate invitation code
    const company = await this.validateInvitationCode(invitation_code);

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(password);

    // Validate database constraints
    this.validateUserConstraints({
      email: email,
      user_name: user_name,
      phone_number: phone_number,
      role_id: UserRole.TEAM_MEMBER,
      status_id: UserStatus.PENDING,
    });

    // Create team member user
    const userId = IdValidator.generateId('USER');
    const newUser = await this.userRepository.create({
      id: userId,
      email: email,
      password_hash: passwordHash,
      user_name: user_name,
      phone_number: phone_number,
      role_id: UserRole.TEAM_MEMBER,
      status_id: UserStatus.PENDING,
      company_id: company.id,
    });

    // Get role and status names
    const role = await prisma.role.findUnique({ where: { id: newUser.role_id } });
    const userStatus = await prisma.userStatus.findUnique({ where: { id: newUser.status_id } });

    return {
      success: true,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          user_name: newUser.user_name,
          role_id: newUser.role_id,
          role_name: role?.role_name || 'TEAM_MEMBER',
          status_id: newUser.status_id,
          status_name: userStatus?.status_name || 'PENDING',
        },
        company: {
          id: company.id,
          company_name: company.company_name,
        },
        message: '회원가입이 완료되었습니다. 회사 관리자의 승인을 기다려주세요.',
      }
    };
  }

  /**
   * Validate email uniqueness
   */
  private async validateEmailUniqueness(email: string) {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('이미 사용 중인 이메일입니다', 'email');
    }
  }

  /**
   * Validate company name uniqueness
   */
  private async validateCompanyNameUniqueness(companyName: string) {
    const existingCompany = await this.companyRepository.findByName(companyName);
    if (existingCompany) {
      throw new ConflictError('이미 등록된 회사명입니다', 'company_name');
    }
  }

  /**
   * Validate invitation code and get company
   */
  private async validateInvitationCode(invitationCode: string) {
    const company = await this.companyRepository.findByInvitationCode(invitationCode);
    if (!company) {
      throw new InvalidInvitationError();
    }
    return company;
  }

  /**
   * Validate user database constraints
   */
  private validateUserConstraints(userData: any) {
    const validation = DbConstraintValidator.validateUserCreation(userData);
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join(', '));
    }
  }

  /**
   * Validate company database constraints
   */
  private validateCompanyConstraints(companyData: any) {
    const validation = DbConstraintValidator.validateCompanyCreation(companyData);
    if (!validation.valid) {
      throw new ValidationError(validation.errors.join(', '));
    }
  }

  /**
   * Create company with manager
   */
  private async createCompanyWithManager(userData: any, companyData: any) {
    const result = await this.userRepository.createWithCompany(userData, companyData);

    // Update company with manager_id
    if (result.company) {
      await this.companyRepository.update(result.company.id, {
        manager_id: result.user.id,
      });
    }

    return result;
  }
}

// DI Container에서 관리하므로 singleton export 제거