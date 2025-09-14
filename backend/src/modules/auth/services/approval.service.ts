import { injectable, inject } from 'tsyringe';
import {
  UserStatus,
  UserRole,
  CompanyStatus,
} from '../interfaces/auth.types';
import {
  ConflictError,
  NotFoundError,
} from '@shared/utils/errors';
import { UserRepository } from '@modules/auth/repositories/user.repository';
import { CompanyRepository } from '@modules/auth/repositories/company.repository';
import { PrismaService } from '@infrastructure/database/prisma.service';

@injectable()
export class ApprovalService {
  constructor(
    @inject('UserRepository') private userRepository: UserRepository,
    @inject('CompanyRepository') private companyRepository: CompanyRepository,
    @inject('PrismaService') private prismaService: PrismaService
  ) {}

  /**
   * Approve company (System Admin only)
   */
  async approveCompany(
    companyId: string, 
    action: 'approve' | 'reject',
    adminId: string,
    comment?: string,
    generateInvitationCode?: boolean
  ) {
    // Verify admin
    const admin = await this.userRepository.findById(adminId);
    if (!admin || admin.role_id !== UserRole.SYSTEM_ADMIN) {
      throw new NotFoundError('Admin not found');
    }

    // Find company
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    if (company.status_id !== CompanyStatus.PENDING) {
      throw new ConflictError('Company is not in pending status');
    }

    // Handle rejection
    if (action === 'reject') {
      await this.prismaService.transaction(async (tx) => {
        // Update company status to INACTIVE
        await tx.company.update({
          where: { id: companyId },
          data: {
            status_id: CompanyStatus.INACTIVE,
          },
        });

        // Update manager status to INACTIVE
        if (company.manager_id) {
          await tx.user.update({
            where: { id: company.manager_id },
            data: { status_id: UserStatus.INACTIVE },
          });
        }
      });

      return {
        message: '회사 가입이 거부되었습니다.',
        comment: comment,
      };
    }

    // Handle approval
    const invitationCode = generateInvitationCode ? await this.generateInvitationCode() : null;

    // Transaction to approve company and manager
    await this.prismaService.transaction(async (tx) => {
      // Update company status
      await tx.company.update({
        where: { id: companyId },
        data: {
          status_id: CompanyStatus.ACTIVE,
          invitation_code: invitationCode,
        },
      });

      // Update manager status
      if (company.manager_id) {
        await tx.user.update({
          where: { id: company.manager_id },
          data: { status_id: UserStatus.ACTIVE },
        });
      }
    });

    // Fetch updated data for response
    const updatedCompany = await this.companyRepository.findById(companyId);
    const manager = company.manager_id ? await this.userRepository.findById(company.manager_id) : null;

    return {
      company: {
        id: updatedCompany!.id,
        company_name: updatedCompany!.company_name,
        status_id: updatedCompany!.status_id,
        status_name: 'ACTIVE',
        invitation_code: invitationCode,
        manager_id: updatedCompany!.manager_id
      },
      manager: manager ? {
        id: manager.id,
        email: manager.email,
        status_id: manager.status_id,
        status_name: 'ACTIVE'
      } : null,
      approved_at: new Date().toISOString(),
      approved_by: adminId
    };
  }

  /**
   * Reject company (System Admin only)
   */
  async rejectCompany(companyId: string, adminId: string, reason?: string) {
    // Verify admin
    const admin = await this.userRepository.findById(adminId);
    if (!admin || admin.role_id !== UserRole.SYSTEM_ADMIN) {
      throw new NotFoundError('Admin not found');
    }

    // Find company
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    if (company.status_id !== CompanyStatus.PENDING) {
      throw new ConflictError('Company is not in pending status');
    }

    // Transaction to reject company and manager
    await this.prismaService.transaction(async (tx) => {
      // Update company status
      await tx.company.update({
        where: { id: companyId },
        data: {
          status_id: CompanyStatus.INACTIVE,
        },
      });

      // Update manager status
      if (company.manager_id) {
        await tx.user.update({
          where: { id: company.manager_id },
          data: { status_id: UserStatus.INACTIVE },
        });
      }

      // TODO: Log rejection reason if provided
      if (reason) {
        console.log(`Company ${companyId} rejected: ${reason}`);
      }
    });

    return {
      message: '회사 가입이 거부되었습니다.',
    };
  }

  /**
   * Approve team member (Company Manager only)
   */
  async approveMember(
    memberId: string, 
    action: 'approve' | 'reject',
    managerId: string,
    comment?: string
  ) {
    // Verify manager
    const manager = await this.userRepository.findById(managerId);
    if (!manager || manager.role_id !== UserRole.COMPANY_MANAGER) {
      throw new NotFoundError('Manager not found');
    }

    // Find member
    const member = await this.userRepository.findById(memberId);
    if (!member) {
      throw new NotFoundError('Member not found');
    }

    // Verify same company
    if (member.company_id !== manager.company_id) {
      throw new NotFoundError('Member not found in your company');
    }

    if (member.status_id !== UserStatus.PENDING) {
      throw new ConflictError('Member is not in pending status');
    }

    // Handle rejection
    if (action === 'reject') {
      await this.userRepository.updateStatus(memberId, UserStatus.INACTIVE);
      
      return {
        user: {
          id: member.id,
          email: member.email,
          user_name: member.user_name,
          status_id: UserStatus.INACTIVE,
          status_name: 'INACTIVE',
          company_id: member.company_id
        },
        rejected_at: new Date().toISOString(),
        rejected_by: managerId,
        comment: comment
      };
    }

    // Handle approval
    await this.userRepository.updateStatus(memberId, UserStatus.ACTIVE);

    return {
      user: {
        id: member.id,
        email: member.email,
        user_name: member.user_name,
        status_id: UserStatus.ACTIVE,
        status_name: 'ACTIVE',
        company_id: member.company_id
      },
      approved_at: new Date().toISOString(),
      approved_by: managerId,
      comment: comment
    };
  }

  /**
   * Reject team member (Company Manager only)
   */
  async rejectMember(memberId: string, managerId: string, reason?: string) {
    // Verify manager
    const manager = await this.userRepository.findById(managerId);
    if (!manager || manager.role_id !== UserRole.COMPANY_MANAGER) {
      throw new NotFoundError('Manager not found');
    }

    // Find member
    const member = await this.userRepository.findById(memberId);
    if (!member) {
      throw new NotFoundError('Member not found');
    }

    // Verify same company
    if (member.company_id !== manager.company_id) {
      throw new NotFoundError('Member not found in your company');
    }

    if (member.status_id !== UserStatus.PENDING) {
      throw new ConflictError('Member is not in pending status');
    }

    // Update member status
    await this.userRepository.updateStatus(memberId, UserStatus.INACTIVE);

    // TODO: Log rejection reason if provided
    if (reason) {
      console.log(`Member ${memberId} rejected: ${reason}`);
    }

    return { message: '팀원 가입이 거부되었습니다.' };
  }

  /**
   * Generate unique invitation code
   */
  private async generateInvitationCode() {
    return await this.companyRepository.generateInvitationCode();
  }

  /**
   * Get pending companies (System Admin only)
   */
  async getPendingCompanies(adminId: string) {
    // Verify admin
    const admin = await this.userRepository.findById(adminId);
    if (!admin || admin.role_id !== UserRole.SYSTEM_ADMIN) {
      throw new NotFoundError('Admin not found');
    }

    return await this.companyRepository.findPendingCompanies();
  }

  /**
   * Get pending members (Company Manager only)
   */
  async getPendingMembers(managerId: string) {
    // Verify manager
    const manager = await this.userRepository.findById(managerId);
    if (!manager || manager.role_id !== UserRole.COMPANY_MANAGER) {
      throw new NotFoundError('Manager not found');
    }

    if (!manager.company_id) {
      throw new NotFoundError('Manager has no company');
    }

    return await this.userRepository.findPendingMembers(manager.company_id);
  }
}

// DI Container에서 관리하므로 singleton export 제거