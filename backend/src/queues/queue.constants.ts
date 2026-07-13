export const QUEUE_NAMES = {
  IMPORT: 'import-processing',
} as const;

export const JOB_NAMES = {
  VALIDATE_FILES: 'validate-files',
  PARSE_INSERT: 'parse-and-insert',
  TRANSFORM_DATA: 'transform-data',
  GENERATE_OUTPUT: 'generate-output',
} as const;

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 2000,
  },
  removeOnComplete: {
    age: 24 * 3600, // Keep completed jobs for 24h
    count: 100,
  },
  removeOnFail: {
    age: 7 * 24 * 3600, // Keep failed jobs for 7 days
  },
};

export const RETRY_CONFIGS = {
  [JOB_NAMES.VALIDATE_FILES]: {
    attempts: 2,
    backoff: { type: 'fixed' as const, delay: 1000 },
  },
  [JOB_NAMES.PARSE_INSERT]: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 2000 },
  },
  [JOB_NAMES.TRANSFORM_DATA]: {
    attempts: 3,
    backoff: { type: 'exponential' as const, delay: 3000 },
  },
  [JOB_NAMES.GENERATE_OUTPUT]: {
    attempts: 2,
    backoff: { type: 'fixed' as const, delay: 5000 },
  },
};
