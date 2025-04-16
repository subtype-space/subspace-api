import express, { Router } from 'express';
import statusController from '../controllers/statusController.js';

const statusRouter: Router = express.Router();

statusRouter.get('/', statusController);
statusRouter.get('/status', statusController); // Added the controller to this route

export default statusRouter;