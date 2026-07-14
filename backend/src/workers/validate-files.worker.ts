import { Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';
import { FileValidatorService } from '../modules/import/file-validator.service';
import { ImportRepository } from '../modules/import/import.repository';
import { publishProgress } from '../modules/import/sse/sse.service';
import { ColumnMappingRepository } from '../modules/column-mapping/column-mapping.repository';
import { importQueue } from '../queues/import.queue';

interface ValidateJobData {
  sessionId: string;
  files: { path: string; originalname: string; fileType: string }[];
}

export const validateFilesProcessor = async (job: Job<ValidateJobData>) => {
    if (job.name !== JOB_NAMES.VALIDATE_FILES) return;

    const { sessionId, files } = job.data;
    const validator = new FileValidatorService(new ColumnMappingRepository());
    const importRepo = new ImportRepository();

    // Update session status
    await importRepo.updateSession(sessionId, { status: 'validating' });
    await publishProgress(sessionId, {
      type: 'status_change',
      status: 'validating',
      message: 'Validating uploaded files...',
    });

    const validationErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Update progress
      await job.updateProgress({
        step: 'validating',
        current: i + 1,
        total: files.length,
        file: file.originalname,
      });

      await publishProgress(sessionId, {
        type: 'progress',
        step: 'validating',
        current: i + 1,
        total: files.length,
        message: `Validating ${file.originalname}...`,
      });

      // Detect file type and validate headers
      const { fileType, valid, errors } = await validator.detectAndValidate(file.path);
      file.fileType = fileType;

      if (!valid) {
        validationErrors.push(
          ...errors.map(e => `${file.originalname}: ${e}`)
        );
      }
    }

    if (validationErrors.length > 0) {
      await importRepo.updateSession(sessionId, { status: 'failed' });
      
      // Log errors to database so they can be viewed/downloaded later
      for (const errorMsg of validationErrors) {
        const colonIndex = errorMsg.indexOf(':');
        const fileName = colonIndex > -1 ? errorMsg.substring(0, colonIndex) : 'validation';
        const message = colonIndex > -1 ? errorMsg.substring(colonIndex + 2) : errorMsg;
        
        await importRepo.createLog({
          session_id: sessionId,
          file_name: fileName,
          row_number: 0,
          log_level: 'error',
          message: message,
          raw_data: JSON.stringify({ step: 'validation' })
        });
      }

      await publishProgress(sessionId, {
        type: 'error',
        message: 'Validation failed',
        errors: validationErrors,
      });
      throw new Error(`Validation failed: ${validationErrors.join('; ')}`);
    }

    // Dispatch parse jobs for each file
    for (const file of files) {
      await importQueue.add(JOB_NAMES.PARSE_INSERT, {
        sessionId,
        filePath: file.path,
        fileName: file.originalname,
        fileType: file.fileType,
      });
    }

    await publishProgress(sessionId, {
      type: 'status_change',
      status: 'processing',
      message: 'Starting file processing...',
    });

    return { validatedFiles: files };
};
