import { Request, Response, NextFunction } from 'express';
import { ImportService } from './import.service';
import { importRepository } from './import.repository';
import path from 'path';
import fs from 'fs';

const OUTPUT_DIR = path.resolve(process.cwd(), '../result');

export class ImportController {
  constructor(private importService: ImportService) {}

  /**
   * POST /api/import/upload
   * Upload 1 or more Excel files dan mulai proses import
   */
  upload = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_FILES', message: 'At least 1 Excel file is required' }
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
      const { page, limit, status } = req.query;
      const result = await this.importService.getSessions({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        status: status as string || undefined,
      });
      res.json({ success: true, data: result });
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

  /**
   * GET /api/import/sessions/:id/outputs/:type
   * Download generated output file (finance or marketing)
   */
  downloadOutput = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id: sessionId, type } = req.params;
      const typeStr = type as string;
      const validTypes = ['finance', 'marketing'];
      
      if (!validTypes.includes(typeStr.toLowerCase())) {
        res.status(400).json({ 
          success: false, 
          error: { message: `Invalid output type. Must be one of: ${validTypes.join(', ')}` } 
        });
        return;
      }

      const fileName = `${typeStr.toUpperCase()}_${sessionId}.xlsx`;
      const filePath = path.join(OUTPUT_DIR, fileName);

      if (!fs.existsSync(filePath)) {
        res.status(404).json({ 
          success: false, 
          error: { message: `Output file not found. The import may not have completed yet.` } 
        });
        return;
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${typeStr.toUpperCase()}.xlsx`);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/import/sessions/:id/transformed
   * Fetch paginated transformed data for preview
   */
  getTransformedData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit } = req.query;
      const data = await this.importService.getTransformedData(
        req.params.id as string,
        Number(page) || 1,
        Number(limit) || 50
      );
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}

export const importController = new ImportController(new ImportService(importRepository));

