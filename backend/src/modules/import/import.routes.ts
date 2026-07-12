import { Router } from 'express';
import { importController } from './import.controller';
import { uploadExcel } from '../../middleware/uploadHandler';

const router = Router();

router.post('/upload', uploadExcel, importController.upload);
router.get('/sessions', importController.getSessions);
router.get('/sessions/:id', importController.getSession);
router.get('/sessions/:id/logs', importController.getSessionLogs);
router.get('/sessions/:id/logs/download', importController.downloadLogs);

export const importRoutes = router;
