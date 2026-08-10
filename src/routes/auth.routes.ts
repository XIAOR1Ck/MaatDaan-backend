import { Router } from 'express';

  import { createUser, loginUser, createAdmin, loginAdmin } from '../controllers/auth.controller';

const authRoutes= Router();

authRoutes.post('/user/register', createUser);
authRoutes.post('/user/login', loginUser);
authRoutes.post('/admin/login', loginAdmin);
//authRoutes.post('/admin/register', createAdmin);

export default authRoutes;
