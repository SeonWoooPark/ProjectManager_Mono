import { Router, Request, Response, NextFunction } from 'express';
import { authController } from '../controllers/auth.controller';
import { 
  authenticateToken, 
  requireSystemAdmin, 
  requireCompanyManager,
  requireSameCompany
} from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validateRequest';
import { body, query } from 'express-validator';
import {
  validateCompanyManagerSignup,
  validateTeamMemberSignup,
} from '../middleware/dbConstraintValidator';

const router = Router();

console.log('[Auth Routes] Initializing auth routes...');

// Validation schemas
const companyManagerSignupValidation = [
  body('user.email').isEmail().normalizeEmail().withMessage('유효한 이메일을 입력해주세요'),
  body('user.password').isLength({ min: 8 }).withMessage('비밀번호는 최소 8자 이상이어야 합니다'),
  body('user.user_name').notEmpty().trim().withMessage('이름을 입력해주세요'),
  body('user.phone_number').optional().matches(/^[0-9+\-\s()]+$/).withMessage('유효한 전화번호를 입력해주세요'),
  body('company.company_name').notEmpty().trim().withMessage('회사명을 입력해주세요'),
  body('company.company_description').optional().trim()
];

const teamMemberSignupValidation = [
  body('user.email').isEmail().normalizeEmail().withMessage('유효한 이메일을 입력해주세요'),
  body('user.password').isLength({ min: 8 }).withMessage('비밀번호는 최소 8자 이상이어야 합니다'),
  body('user.user_name').notEmpty().trim().withMessage('이름을 입력해주세요'),
  body('user.phone_number').optional().matches(/^[0-9+\-\s()]+$/).withMessage('유효한 전화번호를 입력해주세요'),
  body('invitation_code').notEmpty().trim().withMessage('초대 코드를 입력해주세요')
];

const loginValidation = [
  body('email').notEmpty().trim().withMessage('이메일을 입력해주세요'),
  body('password').notEmpty().withMessage('비밀번호를 입력해주세요')
];

const forgotPasswordValidation = [
  body('email').isEmail().normalizeEmail().withMessage('유효한 이메일을 입력해주세요')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('토큰이 필요합니다'),
  body('new_password').isLength({ min: 8 }).withMessage('비밀번호는 최소 8자 이상이어야 합니다'),
  body('confirm_password').notEmpty().withMessage('비밀번호 확인을 입력해주세요')
];

const verifyResetTokenValidation = [
  query('token').notEmpty().withMessage('토큰이 필요합니다')
];

const companyApprovalValidation = [
  body('company_id')
    .notEmpty().withMessage('회사 ID가 필요합니다')
    .matches(/^cmp_[a-zA-Z0-9]{6,}$/).withMessage('올바른 회사 ID 형식이 아닙니다'),
  body('action').isIn(['approve', 'reject']).withMessage('승인 또는 거부를 선택해주세요'),
  body('comment').optional().trim(),
  body('generate_invitation_code').optional().isBoolean()
];

const memberApprovalValidation = [
  body('user_id')
    .notEmpty().withMessage('사용자 ID가 필요합니다')
    .matches(/^usr_[a-zA-Z0-9]{6,}$/).withMessage('올바른 사용자 ID 형식이 아닙니다'),
  body('action').isIn(['approve', 'reject']).withMessage('승인 또는 거부를 선택해주세요'),
  body('comment').optional().trim()
];

// Public routes (no authentication required)

// Signup routes
router.post(
  '/signup/company-manager',
  companyManagerSignupValidation,
  validateRequest,
  validateCompanyManagerSignup, // Add database constraint validation
  authController.signupCompanyManager
);

router.post(
  '/signup/team-member',
  teamMemberSignupValidation,
  validateRequest,
  validateTeamMemberSignup, // Add database constraint validation
  authController.signupTeamMember
);

// Login route
console.log('[Auth Routes] Registering /login route');
router.post(
  '/login',
  (req: Request, _res: Response, next: NextFunction) => {
    console.log('[Auth Routes] Login route handler called');
    console.log('[Auth Routes] Request body:', req.body);
    next();
  },
  loginValidation,
  validateRequest,
  authController.login
);

// Token refresh route
router.post(
  '/refresh',
  authController.refreshToken
);

// Password reset routes
router.post(
  '/password/forgot',
  forgotPasswordValidation,
  validateRequest,
  authController.forgotPassword
);

router.get(
  '/password/verify',
  verifyResetTokenValidation,
  validateRequest,
  authController.verifyResetToken
);

router.post(
  '/password/reset',
  resetPasswordValidation,
  validateRequest,
  authController.resetPassword
);

// Protected routes (authentication required)

// Logout route
router.post(
  '/logout',
  authenticateToken,
  authController.logout
);

// Admin routes

// System admin approves company
router.post(
  '/admin/approve/company',
  authenticateToken,
  requireSystemAdmin,
  companyApprovalValidation,
  validateRequest,
  authController.approveCompany
);

// Company manager approves team member
router.post(
  '/manager/approve/member',
  authenticateToken,
  requireCompanyManager,
  requireSameCompany,
  memberApprovalValidation,
  validateRequest,
  authController.approveMember
);

export default router;