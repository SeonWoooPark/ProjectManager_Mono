import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validateRequest';
import { LoginDto, RegisterDto } from '../types/dto/auth.dto';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRequest(RegisterDto), authController.register);
router.post('/login', validateRequest(LoginDto), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);

export default router;