import { Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';
import { ExcelReaderService } from '../modules/import/excel-reader.service';
import { SalesRawRepository } from '../modules/sales/sales-raw.repository';
import { ColumnMappingRepository } from '../modules/column-mapping/column-mapping.repository';
import { ImportRepository } from '../modules/import/import.repository';
import { TransactionManager } from '../modules/shared/transaction.manager';
import { publishProgress } from '../modules/import/sse/sse.service';
import { importQueue } from '../queues/import.queue';

interface ParseJobData {
  sessionId: string;
  filePath: string;
  fileName: string;
  fileType: 'DAILY' | 'MP' | 'PRODUK';
}

export const parseInsertProcessor = async (job: Job<ParseJobData>) => {
    if (job.name !== JOB_NAMES.PARSE_INSERT) return;

    const { sessionId, filePath, fileName, fileType } = job.data;
    const importRepo = new ImportRepository();
    const salesRawRepo = new SalesRawRepository();
    const columnMappingRepo = new ColumnMappingRepository();

    await importRepo.updateSession(sessionId, { status: 'processing' });

    // Load column mappings from database
    const mappings = await columnMappingRepo.findByFileType(fileType);
    const columnMap = new Map(
      mappings.map(m => [m.source_column, m.internal_field])
    );

    const reader = new ExcelReaderService();
    let processedRows = 0;
    let errorRows = 0;

    // Collect chunks and process them sequentially after reading
    const chunks: any[][] = [];

    reader.on('chunk', (chunk) => {
      chunks.push(chunk);
    });

    await reader.readFileStreaming(filePath, columnMap);

    // Now process all chunks sequentially (reader has finished)
    for (const chunk of chunks) {
      try {
        await TransactionManager.run(async (trx) => {
          const rows = chunk.map((row: any) => ({
            session_id: sessionId,
            file_type: fileType,
            row_number: row.rowNumber,
            ...row.data,
            raw_data: JSON.stringify(row.data),
            status: 'pending',
          }));

          // Bulk insert with upsert
          await salesRawRepo.bulkUpsert(rows, trx);
        });

        processedRows += chunk.length;

        await publishProgress(sessionId, {
          type: 'progress',
          step: 'processing',
          file: fileName,
          processedRows,
          message: `Processed ${processedRows} rows from ${fileName}`,
        });

        await job.updateProgress({ processedRows, file: fileName });
      } catch (error: any) {
        errorRows += chunk.length;
        await importRepo.createLog({
          session_id: sessionId,
          file_name: fileName,
          row_number: chunk[0]?.rowNumber || 0,
          log_level: 'error',
          message: `Chunk insert failed: ${error.message}`,
          raw_data: JSON.stringify(chunk),
        });
      }
    }

    // Update session counters — now accurate since all chunks are processed
    await importRepo.incrementSessionCounters(sessionId, {
      processed_rows: processedRows,
      error_rows: errorRows,
    });

    // Check if all 3 files are done
    const pendingJobs = await importQueue.getWaiting();
    const activeJobs = await importQueue.getActive();
    const parseJobs = [...pendingJobs, ...activeJobs].filter(
      j => j.name === JOB_NAMES.PARSE_INSERT && j.data.sessionId === sessionId
    );

    if (parseJobs.length <= 1) {
      // All files processed (only the current active job remains) — dispatch transform job
      await importQueue.add(JOB_NAMES.TRANSFORM_DATA, { sessionId });
    }

    return { processedRows, errorRows, fileName };
};
