import { Router } from 'express';

import { createUser, loginUser } from '../controllers/auth.controller';

const authRoutes= Router();

authRoutes.post('/user/register', createUser);
authRoutes.post('/user/login', loginUser);

export default authRoutes;
