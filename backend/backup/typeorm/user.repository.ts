import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

export class UserRepository {
  private repository: Repository<User>;

  constructor() {
    this.repository = AppDataSource.getRepository(User);
  }

  async findAll(): Promise<User[]> {
    return await this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
  }

  async findById(id: string): Promise<User | null> {
    return await this.repository.findOne({ 
      where: { id, isActive: true } 
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.repository.findOne({ 
      where: { email, isActive: true },
      select: ['id', 'email', 'password', 'username', 'firstName', 'lastName', 'role', 'isActive', 'isEmailVerified']
    });
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .addSelect('user.password')
      .getOne();
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.repository.create(data);
    return await this.repository.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const result = await this.repository.update(
      { id, isActive: true }, 
      data
    );
    
    if (result.affected === 0) {
      return null;
    }
    
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    // Soft delete: set isActive to false instead of actually deleting
    const result = await this.repository.update(
      { id }, 
      { isActive: false, deletedAt: new Date() }
    );
    
    return result.affected > 0;
  }

  async hardDelete(id: string): Promise<boolean> {
    // Actual delete from database
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async findByResetToken(token: string): Promise<User | null> {
    return await this.repository.findOne({
      where: { 
        resetPasswordToken: token,
        isActive: true
      }
    });
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.repository.update(id, { 
      lastLoginAt: new Date() 
    });
  }

  async count(): Promise<number> {
    return await this.repository.count({
      where: { isActive: true }
    });
  }

  async search(query: string): Promise<User[]> {
    return await this.repository
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true })
      .andWhere(
        '(user.username ILIKE :query OR user.email ILIKE :query OR user.firstName ILIKE :query OR user.lastName ILIKE :query)',
        { query: `%${query}%` }
      )
      .orderBy('user.createdAt', 'DESC')
      .getMany();
  }
}