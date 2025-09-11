/**
 * Email Service
 * 
 * 이메일 발송 서비스 (향후 구현)
 * 현재는 인터페이스와 Mock 구현만 제공
 */

export interface IEmailService {
  sendPasswordResetEmail(to: string, resetToken: string): Promise<void>;
  sendWelcomeEmail(to: string, userName: string): Promise<void>;
  sendApprovalNotification(to: string, type: 'company' | 'member', status: 'approved' | 'rejected'): Promise<void>;
}

/**
 * Mock Email Service (개발용)
 * 실제 운영에서는 SendGrid, AWS SES 등을 사용
 */
export class MockEmailService implements IEmailService {
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    console.log(`[Mock Email] Password reset email sent to: ${to}`);
    console.log(`[Mock Email] Reset token: ${resetToken}`);
    console.log(`[Mock Email] Reset URL: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`);
  }

  async sendWelcomeEmail(to: string, userName: string): Promise<void> {
    console.log(`[Mock Email] Welcome email sent to: ${to}`);
    console.log(`[Mock Email] User name: ${userName}`);
  }

  async sendApprovalNotification(to: string, type: 'company' | 'member', status: 'approved' | 'rejected'): Promise<void> {
    console.log(`[Mock Email] Approval notification sent to: ${to}`);
    console.log(`[Mock Email] Type: ${type}, Status: ${status}`);
  }
}

/**
 * 실제 Email Service (향후 구현)
 * 
 * SendGrid 사용 예시:
 * ```typescript
 * export class SendGridEmailService implements IEmailService {
 *   private client: MailService;
 *   
 *   constructor() {
 *     this.client = new MailService();
 *     this.client.setApiKey(process.env.SENDGRID_API_KEY!);
 *   }
 *   
 *   async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
 *     const msg = {
 *       to,
 *       from: process.env.FROM_EMAIL!,
 *       templateId: process.env.RESET_PASSWORD_TEMPLATE_ID!,
 *       dynamicTemplateData: {
 *         resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
 *       },
 *     };
 *     
 *     await this.client.send(msg);
 *   }
 *   
 *   // ... 기타 메서드들
 * }
 * ```
 */

// Email Service 싱글톤
let emailServiceInstance: IEmailService | null = null;

export const getEmailService = (): IEmailService => {
  if (!emailServiceInstance) {
    // 실제 운영에서는 SendGrid나 AWS SES 사용
    // const isProduction = process.env.NODE_ENV === 'production';
    // emailServiceInstance = isProduction ? new SendGridEmailService() : new MockEmailService();
    emailServiceInstance = new MockEmailService();
  }
  return emailServiceInstance;
};