import { AuthenticatedRequest, UserRole, UserStatus } from '@modules/auth/interfaces/auth.types';
import { MembersRepository } from '../repositories/members.repository';
import { AuthorizationError, ConflictError, NotFoundError, ValidationError } from '@shared/utils/errors';
import { IdValidator, RangeValidator, LengthValidator } from '@shared/utils/dbConstraints';
import { injectable, inject } from 'tsyringe';
import { User } from '@prisma/client';

@injectable()
export class MembersService {
  constructor(@inject('MembersRepository') private repo: MembersRepository) {}

  async listCompanyMembers(
    user: NonNullable<AuthenticatedRequest['user']>,
    filters: { status_id?: number; role_id?: number }
  ) {
    if (!user.company_id && user.role_id !== 1) throw new AuthorizationError('회사 식별 불가');
    return this.repo.listCompanyMembers(user, filters);
  }

  async listPendingMembers(user: NonNullable<AuthenticatedRequest['user']>) {
    if (!user.company_id) throw new AuthorizationError('회사 식별 불가');
    return this.repo.listPendingMembers(user);
  }

  async getProjectMembers(user: NonNullable<AuthenticatedRequest['user']>, projectId: string) {
    const valid = IdValidator.validateProjectId(projectId);
    if (!valid.valid) throw new ValidationError(valid.errors.join(', '));
    return this.repo.getProjectMembers(user, projectId);
  }

  async updateMemberStatus(
    actor: NonNullable<AuthenticatedRequest['user']>,
    memberId: string,
    statusId: number
  ) {
    const idCheck = IdValidator.validateUserId(memberId);
    if (!idCheck.valid) throw new ValidationError(idCheck.errors.join(', '));

    const statusCheck = RangeValidator.validateUserStatusId(statusId);
    if (!statusCheck.valid) throw new ValidationError(statusCheck.errors.join(', '));
    if (![UserStatus.ACTIVE, UserStatus.INACTIVE].includes(statusId)) {
      throw new ValidationError('사용자 상태는 ACTIVE(1) 또는 INACTIVE(2)로만 변경할 수 있습니다', 'status_id');
    }

    const target = await this.repo.findMemberById(memberId);
    if (!target) throw new NotFoundError('사용자를 찾을 수 없습니다', 'user');

    this.assertManagerOrAdmin(actor, target);

    if (target.status_id === statusId) {
      return this.formatMember(target);
    }

    const updated = await this.repo.updateMemberStatus(memberId, statusId);
    return this.formatMember(updated);
  }

  async updateMemberProfile(
    actor: NonNullable<AuthenticatedRequest['user']>,
    memberId: string,
    payload: {
      user_name?: string;
      phone_number?: string | null;
      email?: string;
    }
  ) {
    const idCheck = IdValidator.validateUserId(memberId);
    if (!idCheck.valid) throw new ValidationError(idCheck.errors.join(', '));

    const target = await this.repo.findMemberById(memberId);
    if (!target) throw new NotFoundError('사용자를 찾을 수 없습니다', 'user');

    const isSelf = actor.id === memberId;
    if (!isSelf) {
      this.assertManagerOrAdmin(actor, target);
    }

    const updates: Partial<Pick<User, 'user_name' | 'phone_number' | 'email'>> = {};

    if (payload.user_name !== undefined) {
      const trimmedName = payload.user_name.trim();
      const nameValidation = LengthValidator.validateUserName(trimmedName);
      if (!nameValidation.valid) throw new ValidationError(nameValidation.errors.join(', '), 'user_name');
      if (trimmedName && trimmedName !== target.user_name) {
        updates.user_name = trimmedName;
      }
    }

    if (payload.phone_number !== undefined) {
      let normalizedPhone: string | null = null;
      if (payload.phone_number !== null) {
        const raw = typeof payload.phone_number === 'string' ? payload.phone_number.trim() : '';
        normalizedPhone = raw.length === 0 ? null : raw;
      }
      const phoneValidation = LengthValidator.validatePhoneNumber(normalizedPhone);
      if (!phoneValidation.valid) throw new ValidationError(phoneValidation.errors.join(', '), 'phone_number');
      if (normalizedPhone !== target.phone_number) {
        updates.phone_number = normalizedPhone;
      }
    }

    if (payload.email !== undefined) {
      const normalizedEmail = payload.email.trim().toLowerCase();
      const emailValidation = LengthValidator.validateEmail(normalizedEmail);
      if (!emailValidation.valid) throw new ValidationError(emailValidation.errors.join(', '), 'email');
      if (normalizedEmail !== target.email) {
        const existing = await this.repo.findMemberByEmail(normalizedEmail, memberId);
        if (existing) throw new ConflictError('이미 사용 중인 이메일입니다', 'email');
        updates.email = normalizedEmail;
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new ValidationError('변경된 값이 없습니다');
    }

    const updated = await this.repo.updateMemberProfile(memberId, updates);
    return this.formatMember(updated);
  }

  private assertManagerOrAdmin(
    actor: NonNullable<AuthenticatedRequest['user']>,
    target: Awaited<ReturnType<MembersRepository['findMemberById']>>
  ) {
    if (actor.role_id === UserRole.SYSTEM_ADMIN) {
      return;
    }

    if (target?.role_id === UserRole.SYSTEM_ADMIN) {
      throw new AuthorizationError('시스템 관리자 정보를 수정할 수 없습니다');
    }

    if (actor.role_id !== UserRole.COMPANY_MANAGER) {
      throw new AuthorizationError('권한이 없습니다');
    }

    if (!actor.company_id) {
      throw new AuthorizationError('회사 정보가 필요합니다');
    }

    if (target?.company_id !== actor.company_id) {
      throw new AuthorizationError('다른 회사의 사용자는 수정할 수 없습니다');
    }
  }

  private formatMember(member: Awaited<ReturnType<MembersRepository['findMemberById']>>) {
    if (!member) return null;
    return {
      id: member.id,
      email: member.email,
      user_name: member.user_name,
      phone_number: member.phone_number,
      role_id: member.role_id,
      role_name: member.role?.role_name ?? null,
      status_id: member.status_id,
      status_name: member.status?.status_name ?? null,
      company_id: member.company_id,
      created_at: member.created_at instanceof Date ? member.created_at.toISOString() : member.created_at,
      updated_at: member.updated_at instanceof Date ? member.updated_at.toISOString() : member.updated_at,
    };
  }
}
