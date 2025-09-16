import { User, Company } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { BaseRepository } from '@infrastructure/database/base.repository';
import { IUserRepository } from '../interfaces/repository.interfaces';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { IdValidator } from '@shared/utils/dbConstraints';

@injectable()
export class UserRepository extends BaseRepository<User> implements IUserRepository {
  constructor(
    @inject('PrismaService') prismaService: PrismaService
  ) {
    super(prismaService.getClient(), 'user');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByIdWithCompany(id: string): Promise<(User & { company: Company | null }) | null> {
    return this.model.findUnique({
      where: { id },
      include: { company: true },
    });
  }

  async createWithCompany(
    userData: any,
    companyData?: any
  ): Promise<{ user: User; company?: Company }> {
    return this.transaction(async (tx) => {
      let company: Company | undefined;

      if (companyData) {
        const companyId = IdValidator.generateId('COMPANY');
        company = await tx.company.create({
          data: {
            id: companyId,
            ...companyData,
            created_at: new Date(),
          },
        });
        userData.company_id = companyId;
      }

      const userId = IdValidator.generateId('USER');
      const user = await tx.user.create({
        data: {
          id: userId,
          ...userData,
          created_at: new Date(),
        },
      });

      return { user, company };
    });
  }

  async updateStatus(userId: string, statusId: number): Promise<User> {
    return this.update(userId, { 
      status_id: statusId,
      updated_at: new Date()
    });
  }

  async updatePassword(userId: string, passwordHash: string): Promise<User> {
    return this.update(userId, { 
      password_hash: passwordHash,
      updated_at: new Date()
    });
  }

  async findPendingMembers(companyId: string): Promise<User[]> {
    return this.findAll({
      where: {
        company_id: companyId,
        status_id: 3, // PENDING status
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findByCompanyId(companyId: string): Promise<User[]> {
    return this.findAll({
      where: { company_id: companyId },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateLastLogin(userId: string): Promise<User> {
    return this.update(userId, { 
      updated_at: new Date()
    });
  }

  async findActiveUsersByRole(roleId: number): Promise<User[]> {
    return this.findAll({
      where: {
        role_id: roleId,
        status_id: 1, // ACTIVE status
      },
    });
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: {
      status_id?: number;
      role_id?: number;
      company_id?: string;
    }
  ) {
    return this.paginate({
      page,
      limit,
      where: filters,
      include: { company: true },
      orderBy: { created_at: 'desc' },
    });
  }
}