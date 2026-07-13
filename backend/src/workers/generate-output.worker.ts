import { Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';
import { publishProgress } from '../modules/import/sse/sse.service';
import { ImportRepository } from '../modules/import/import.repository';
import { SalesRawRepository } from '../modules/sales/sales-raw.repository';

import { OutputGeneratorService } from '../modules/transformation/output/output-generator.service';
import fs from 'fs/promises';
import path from 'path';

interface GenerateJobData {
  sessionId: string;
}

const OUTPUT_DIR = path.resolve(process.cwd(), '../result');

export const generateOutputProcessor = async (job: Job<GenerateJobData>) => {
    if (job.name !== JOB_NAMES.GENERATE_OUTPUT) return;
    
    const { sessionId } = job.data;
    const importRepo = new ImportRepository();
    const salesRawRepo = new SalesRawRepository();
    
    await publishProgress(sessionId, {
      type: 'status_change',
      status: 'generating',
      message: 'Generating output reports...',
    });
    
    // Ensure output dir exists
    await fs.mkdir(OUTPUT_DIR, { recursive: true });
    
    const outputService = new OutputGeneratorService();
    
    // Generate FINANCE.XLSX
    const financeBuffer = await outputService.generateFinance(sessionId);
    const financePath = path.join(OUTPUT_DIR, `FINANCE_${sessionId}.xlsx`);
    await fs.writeFile(financePath, financeBuffer);

    await publishProgress(sessionId, {
      type: 'progress',
      step: 'generating',
      message: 'FINANCE.XLSX generated',
    });

    // Generate MARKETING.XLSX
    const marketingBuffer = await outputService.generateMarketing(sessionId);
    const marketingPath = path.join(OUTPUT_DIR, `MARKETING_${sessionId}.xlsx`);
    await fs.writeFile(marketingPath, marketingBuffer);

    // Update session with accurate total_rows from sales_raw
    const { total: totalRows } = await salesRawRepo.findBySessionId(sessionId, { page: 1, limit: 1 });
    
    await importRepo.updateSession(sessionId, { 
      status: 'completed',
      total_rows: totalRows,
    });
    
    await publishProgress(sessionId, {
      type: 'completed',
      status: 'completed',
      message: 'Output generation complete. Process finished.',
    });
    
    return { status: 'generated', financePath, marketingPath };
};

