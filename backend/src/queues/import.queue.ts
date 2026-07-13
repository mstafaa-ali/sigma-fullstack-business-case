import { Queue, FlowProducer } from 'bullmq';
import { redisConfig } from '../config/redis';
import { QUEUE_NAMES, DEFAULT_JOB_OPTIONS, JOB_NAMES, RETRY_CONFIGS } from './queue.constants';

export const importQueue = new Queue(QUEUE_NAMES.IMPORT, {
  connection: redisConfig as any,
  defaultJobOptions: DEFAULT_JOB_OPTIONS,
});

export const flowProducer = new FlowProducer({
  connection: redisConfig as any,
});

/**
 * Membuat flow job untuk import pipeline
 * Flow: validate → parse (3 parallel) → transform → generate
 */
export async function createImportFlow(sessionId: string, files: {
  path: string;
  originalname: string;
  fileType: string;
}[]) {
  // Step 1: Create the validate job
  await importQueue.add(JOB_NAMES.VALIDATE_FILES, {
    sessionId,
    files,
  }, {
    jobId: `validate-${sessionId}`,
    ...DEFAULT_JOB_OPTIONS,
    ...RETRY_CONFIGS[JOB_NAMES.VALIDATE_FILES],
  });
}
