import { Company } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { BaseRepository } from '@infrastructure/database/base.repository';
import { ICompanyRepository } from '@shared/interfaces/repository.interfaces';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IdValidator } from '@shared/utils/dbConstraints';
import crypto from 'crypto';

@injectable()
export class CompanyRepository extends BaseRepository<Company> implements ICompanyRepository {
  constructor(
    @inject('PrismaService') prismaService: PrismaService
  ) {
    super(prismaService.getClient(), 'company');
  }

  async findByName(name: string): Promise<Company | null> {
    return this.findOne({
      where: { company_name: name },
    });
  }

  async findPendingCompanies(): Promise<Company[]> {
    return this.findAll({
      where: {
        status_id: 2, // PENDING status
      },
      include: {
        manager: true,
        status: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateApprovalStatus(
    companyId: string, 
    statusId: number, 
    invitationCode?: string
  ): Promise<Company> {
    const updateData: any = {
      status_id: statusId,
    };

    if (invitationCode) {
      updateData.invitation_code = invitationCode;
    }

    return this.update(companyId, updateData, {
      include: {
        manager: true,
        status: true,
      },
    });
  }

  async generateInvitationCode(): Promise<string> {
    let code: string;
    let isUnique = false;

    while (!isUnique) {
      // Generate a 6-character alphanumeric code
      code = crypto.randomBytes(3).toString('hex').toUpperCase();
      
      // Check if the code is unique
      const existing = await this.findOne({
        where: { invitation_code: code },
      });
      
      if (!existing) {
        isUnique = true;
      }
    }

    return code!;
  }

  async findByInvitationCode(code: string): Promise<Company | null> {
    return this.findOne({
      where: { 
        invitation_code: code,
        status_id: 1, // ACTIVE status
      },
      include: {
        manager: true,
        status: true,
      },
    });
  }

  async findWithEmployees(companyId: string): Promise<Company | null> {
    return this.findById(companyId, {
      include: {
        manager: true,
        employees: {
          orderBy: { created_at: 'desc' },
        },
        projects: {
          orderBy: { created_at: 'desc' },
        },
        status: true,
      },
    });
  }

  async updateManager(companyId: string, managerId: string): Promise<Company> {
    return this.update(companyId, {
      manager_id: managerId,
    });
  }

  async getActiveCompanies(): Promise<Company[]> {
    return this.findAll({
      where: {
        status_id: 1, // ACTIVE status
      },
      include: {
        manager: true,
        status: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getCompanyStatistics(companyId: string): Promise<any> {
    const client = this.prisma;
    
    const [company, employeeCount, projectCount, activeProjectCount] = await Promise.all([
      this.findById(companyId, {
        include: {
          manager: true,
          status: true,
        },
      }),
      client.user.count({
        where: { company_id: companyId },
      }),
      client.project.count({
        where: { company_id: companyId },
      }),
      client.project.count({
        where: {
          company_id: companyId,
          status_id: 2, // IN_PROGRESS status
        },
      }),
    ]);

    return {
      company,
      statistics: {
        employeeCount,
        projectCount,
        activeProjectCount,
      },
    };
  }

  async createWithManager(companyData: any, managerId: string): Promise<Company> {
    const companyId = IdValidator.generateId('COMPANY');
    
    return this.create({
      id: companyId,
      ...companyData,
      manager_id: managerId,
      created_at: new Date(),
    });
  }
}