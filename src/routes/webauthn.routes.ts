import { Router } from "express";
import * as controller from '../controllers/webauthn.controller';

const webauthnRouter = Router();
webauthnRouter.post('/register/options', controller.registerOptions);
webauthnRouter.post('/register/verify', controller.registerVerify);

webauthnRouter.post('/login/options', controller.loginOptions);
webauthnRouter.post('/login/verify', controller.loginVerify);


export default webauthnRouter;
