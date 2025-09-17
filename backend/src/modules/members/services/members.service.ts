import { AuthenticatedRequest } from '@modules/auth/interfaces/auth.types';
import { MembersRepository } from '../repositories/members.repository';
import { AuthorizationError, ValidationError } from '@shared/utils/errors';
import { IdValidator } from '@shared/utils/dbConstraints';
import { injectable, inject } from 'tsyringe';

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
}
