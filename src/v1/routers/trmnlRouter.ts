import express, { Router } from 'express'
import trmnlController from '../controllers/trmnlController.js';

const trmnlRouter = express.Router();
trmnlRouter.get('/', trmnlController);

//router.get('/installation_success', trmnlInstallSuccessController)

// Change this line
export default trmnlRouter;
// Or you can use this for named export
// export = router;