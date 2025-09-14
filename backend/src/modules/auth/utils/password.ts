import bcrypt from 'bcryptjs';

export class PasswordManager {
  private readonly saltRounds: number = 10;
  private readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Hash password
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  // Compare password with hash
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Verify password (alias for comparePassword for backward compatibility)
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await this.comparePassword(password, hash);
  }

  // Validate password policy
  validatePasswordPolicy(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password || password.length < 8) {
      errors.push('비밀번호는 최소 8자 이상이어야 합니다');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('비밀번호는 최소 하나의 소문자를 포함해야 합니다');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('비밀번호는 최소 하나의 대문자를 포함해야 합니다');
    }

    if (!/\d/.test(password)) {
      errors.push('비밀번호는 최소 하나의 숫자를 포함해야 합니다');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push('비밀번호는 최소 하나의 특수문자(@$!%*?&)를 포함해야 합니다');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Check if password meets policy
  isValidPassword(password: string): boolean {
    return this.passwordRegex.test(password);
  }

  // Generate random password (for temporary passwords)
  generateRandomPassword(): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '@$!%*?&';
    const all = lowercase + uppercase + numbers + special;

    let password = '';
    // Ensure at least one character from each required group
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = 0; i < 8; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Check password strength
  getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' | 'very_strong' {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&#]/.test(password)) strength++;
    if (/[^A-Za-z0-9@$!%*?&#]/.test(password)) strength++;

    if (strength < 3) return 'weak';
    if (strength < 5) return 'medium';
    if (strength < 7) return 'strong';
    return 'very_strong';
  }
}

export const passwordManager = new PasswordManager();