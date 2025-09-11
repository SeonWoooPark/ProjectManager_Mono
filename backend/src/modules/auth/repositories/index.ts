export { UserRepository } from './user.repository';
export { TokenRepository } from './token.repository';
export { CompanyRepository } from './company.repository';

// Repository singleton instances
import { UserRepository } from './user.repository';
import { TokenRepository } from './token.repository';
import { CompanyRepository } from './company.repository';
import { PrismaService } from '@infrastructure/database/prisma.service';

let userRepositoryInstance: UserRepository | null = null;
let tokenRepositoryInstance: TokenRepository | null = null;
let companyRepositoryInstance: CompanyRepository | null = null;

export const getUserRepository = (): UserRepository => {
  if (!userRepositoryInstance) {
    const prismaService = PrismaService.getInstance();
    userRepositoryInstance = new UserRepository(prismaService);
  }
  return userRepositoryInstance;
};

export const getTokenRepository = (): TokenRepository => {
  if (!tokenRepositoryInstance) {
    const prismaService = PrismaService.getInstance();
    tokenRepositoryInstance = new TokenRepository(prismaService);
  }
  return tokenRepositoryInstance;
};

export const getCompanyRepository = (): CompanyRepository => {
  if (!companyRepositoryInstance) {
    const prismaService = PrismaService.getInstance();
    companyRepositoryInstance = new CompanyRepository(prismaService);
  }
  return companyRepositoryInstance;
};