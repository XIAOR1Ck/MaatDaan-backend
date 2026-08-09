import { Router } from 'express';

import { createUser } from '../controllers/auth.controller';

const authRoutes= Router();

authRoutes.post('/user/register', createUser);

export default authRoutes;
