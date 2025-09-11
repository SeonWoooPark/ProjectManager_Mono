export { UserRepository } from './user.repository';
export { TokenRepository } from './token.repository';
export { CompanyRepository } from './company.repository';

// Repository singleton instances
import { UserRepository } from './user.repository';
import { TokenRepository } from './token.repository';
import { CompanyRepository } from './company.repository';

let userRepositoryInstance: UserRepository | null = null;
let tokenRepositoryInstance: TokenRepository | null = null;
let companyRepositoryInstance: CompanyRepository | null = null;

export const getUserRepository = (): UserRepository => {
  if (!userRepositoryInstance) {
    userRepositoryInstance = new UserRepository();
  }
  return userRepositoryInstance;
};

export const getTokenRepository = (): TokenRepository => {
  if (!tokenRepositoryInstance) {
    tokenRepositoryInstance = new TokenRepository();
  }
  return tokenRepositoryInstance;
};

export const getCompanyRepository = (): CompanyRepository => {
  if (!companyRepositoryInstance) {
    companyRepositoryInstance = new CompanyRepository();
  }
  return companyRepositoryInstance;
};