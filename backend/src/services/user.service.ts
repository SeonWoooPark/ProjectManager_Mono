import { AppError } from '../middleware/errorHandler';
import { UserRepository } from '../repositories/user.repository';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async getAllUsers() {
    return await this.userRepository.findAll();
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateUser(id: string, data: any) {
    const user = await this.userRepository.update(id, data);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async deleteUser(id: string) {
    const result = await this.userRepository.delete(id);
    if (!result) {
      throw new AppError('User not found', 404);
    }
    return result;
  }
}