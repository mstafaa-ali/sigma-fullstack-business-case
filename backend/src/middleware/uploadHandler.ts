import multer from 'multer';
import path from 'path';
import { config } from '../config';
import { ValidationError } from '../shared/errors';
import fs from 'fs';

// Ensure upload directory exists
if (!fs.existsSync(config.UPLOAD_DIR)) {
  fs.mkdirSync(config.UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: config.UPLOAD_DIR,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError('Only Excel files (.xlsx, .xls) are allowed'));
  }
};

export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.MAX_FILE_SIZE },
}).array('files', 3); // Maksimal 3 file sekaligus
