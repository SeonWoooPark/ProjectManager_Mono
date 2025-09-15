import { User, Company } from '@prisma/client';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByIdWithCompany(id: string): Promise<(User & { company: Company | null }) | null>;
  createWithCompany(userData: any, companyData?: any): Promise<{ user: User; company?: Company }>;
  updateStatus(userId: string, statusId: number): Promise<User>;
  updatePassword(userId: string, passwordHash: string): Promise<User>;
  findPendingMembers(companyId: string): Promise<User[]>;
  findByCompanyId(companyId: string): Promise<User[]>;
  updateLastLogin(userId: string): Promise<User>;
}

export interface ITokenRepository {
  saveRefreshToken(userId: string, token: string, expiresAt: Date, tokenFamily?: string): Promise<void>;
  findRefreshToken(token: string): Promise<any | null>;
  invalidateToken(token: string): Promise<void>;
  invalidateUserTokens(userId: string): Promise<void>;
  invalidateTokenFamily(tokenFamily: string): Promise<void>;
  cleanExpiredTokens(): Promise<void>;
  saveResetToken(userId: string, token: string, expiresAt: Date): Promise<void>;
  findResetToken(token: string): Promise<any | null>;
  markResetTokenUsed(token: string): Promise<void>;
  addToBlacklist(token: string, expiresAt: Date): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
}

export interface ICompanyRepository {
  findById(id: string): Promise<Company | null>;
  findByName(name: string): Promise<Company | null>;
  findPendingCompanies(): Promise<Company[]>;
  updateApprovalStatus(companyId: string, statusId: number, invitationCode?: string): Promise<Company>;
  create(data: any): Promise<Company>;
  update(id: string, data: any): Promise<Company>;
  delete(id: string): Promise<Company>;
}