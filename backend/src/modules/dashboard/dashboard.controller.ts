import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';

export class DashboardController {
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
      const stats = await dashboardService.getStats(year);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
