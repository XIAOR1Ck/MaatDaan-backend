import { Router } from "express";
import * as controller from '../controllers/webauthn.controller';
import { protect } from "../middleware/auth";

const webauthnRouter = Router();
webauthnRouter.post('/register/options', protect, controller.registerOptions);
webauthnRouter.post('/register/verify',protect, controller.registerVerify);

webauthnRouter.post('/login/options', protect, controller.loginOptions);
webauthnRouter.post('/login/verify', protect, controller.loginVerify);


export default webauthnRouter;
