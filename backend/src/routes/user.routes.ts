import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';

const router = Router();
const userController = new UserController();

router.use(authenticate);

router.get('/', authorize(['admin']), userController.getAllUsers);
router.get('/profile', userController.getProfile);
router.get('/:id', userController.getUserById);
router.put('/profile', userController.updateProfile);
router.delete('/:id', authorize(['admin']), userController.deleteUser);

export default router;