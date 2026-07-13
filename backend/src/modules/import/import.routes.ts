import { Router } from 'express';
import { importController } from './import.controller';
import { uploadExcel } from '../../middleware/uploadHandler';
import { streamProgress } from './sse/sse.controller';

const router = Router();

router.post('/upload', uploadExcel, importController.upload);
router.get('/sessions', importController.getSessions);
router.get('/sessions/:id', importController.getSession);
router.get('/sessions/:id/progress', streamProgress);
router.get('/sessions/:id/logs', importController.getSessionLogs);
router.get('/sessions/:id/logs/download', importController.downloadLogs);
router.get('/sessions/:id/outputs/:type', importController.downloadOutput);
router.get('/sessions/:id/transformed', importController.getTransformedData);

export const importRoutes = router;
