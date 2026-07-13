import { Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';

import { validateFilesProcessor } from './validate-files.worker';
import { parseInsertProcessor } from './parse-insert.worker';
import { transformDataProcessor } from './transform-data.worker';
import { generateOutputProcessor } from './generate-output.worker';

const processor = async (job: Job) => {
  switch (job.name) {
    case JOB_NAMES.VALIDATE_FILES:
      return validateFilesProcessor(job as any);
    case JOB_NAMES.PARSE_INSERT:
      return parseInsertProcessor(job as any);
    case JOB_NAMES.TRANSFORM_DATA:
      return transformDataProcessor(job as any);
    case JOB_NAMES.GENERATE_OUTPUT:
      return generateOutputProcessor(job as any);
    default:
      throw new Error(`Unknown job name: ${job.name}`);
  }
};

export const mainWorker = new Worker(QUEUE_NAMES.IMPORT, processor, {
  connection: redisConfig,
  concurrency: 1, // Changed from 3 to 1 to prevent Out of Memory (OOM) crashes on large files
});

export const importWorkers = [mainWorker];

export async function closeWorkers() {
  await mainWorker.close();
}
