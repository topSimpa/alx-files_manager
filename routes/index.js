import { Router } from 'express';
import AppController from '../controllers/AppController';
import AuthController from '../controllers/AuthController';
import UsersController from '../controllers/UsersController';
import FilesController from '../controllers/FilesController';

const router = new Router();

router.get('/connect', (req, res) => AuthController.getConnect(req, res));
router.get('/disconnect', AuthController.getDisconnect);
router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.get('/users/me', UsersController.getMe);
router.post('/files', FilesController.postUpload);
router.post('/users', UsersController.postNew);

module.exports = router;