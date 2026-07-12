import { Request, Response, NextFunction } from 'express';
import { ImportService } from './import.service';
import { importRepository } from './import.repository';

export class ImportController {
  constructor(private importService: ImportService) {}

  /**
   * POST /api/import/upload
   * Upload 3 Excel files dan mulai proses import
   */
  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length !== 3) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_FILES', message: 'Exactly 3 Excel files required' }
        });
        return;
      }

      // Create import session dan dispatch ke queue
      const session = await this.importService.initiateImport(files);

      res.status(202).json({
        success: true,
        data: {
          sessionId: session.id,
          status: session.status,
          message: 'Import initiated. Track progress via SSE.',
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/import/sessions
   * List semua import sessions
   */
  getSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = req.query;
      const result = await this.importService.getSessions({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/import/sessions/:id
   * Detail satu import session
   */
  getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const session = await this.importService.getSessionById(req.params.id as string);
      if (!session) {
        res.status(404).json({ success: false, error: { message: 'Session not found' } });
        return;
      }
      res.json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/import/sessions/:id/logs
   * Download error logs untuk session tertentu
   */
  getSessionLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { level } = req.query;
      const logs = await this.importService.getSessionLogs(
        req.params.id as string,
        level as string
      );
      res.json({ success: true, data: logs });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/import/sessions/:id/logs/download
   * Download error log sebagai file
   */
  downloadLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.importService.generateLogFile(req.params.id as string);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=error_log_${req.params.id}.xlsx`);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}

export const importController = new ImportController(new ImportService(importRepository));
