import { Router } from "express";
import * as controller from '../controllers/webauthn.controller';
import { protect } from "../middleware/auth";

const webauthnRouter = Router();
webauthnRouter.post('/register/options', protect, controller.registerOptions);
webauthnRouter.post('/register/verify', controller.registerVerify);

webauthnRouter.post('/login/options', protect, controller.loginOptions);
webauthnRouter.post('/login/verify', controller.loginVerify);


export default webauthnRouter;
