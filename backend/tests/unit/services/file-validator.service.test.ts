import { describe, it, expect, vi } from 'vitest';
import { FileValidatorService } from '../../../src/modules/import/file-validator.service';
import { ColumnMappingRepository } from '../../../src/modules/column-mapping/column-mapping.repository';
import path from 'path';

vi.mock('../../../src/modules/column-mapping/column-mapping.repository');

describe('FileValidatorService', () => {
  let validator: FileValidatorService;
  let mockRepo: vi.Mocked<ColumnMappingRepository>;

  beforeAll(() => {
    mockRepo = new ColumnMappingRepository() as any;
    mockRepo.findByFileType = vi.fn().mockImplementation(async (type) => {
      if (type === 'DAILY') return [{ source_column: 'Warehouse' }, { source_column: 'Status Order' }];
      if (type === 'MP') return [{ source_column: 'City' }, { source_column: 'Province' }];
      return [{ source_column: 'ProvinsiCustomer' }];
    });
    validator = new FileValidatorService(mockRepo);
  });

  it('should detect DAILY file type', async () => {
    const type = await validator.detectFileType(path.join(__dirname, '../../fixtures/SALES_DAILY_TEST.xlsx'));
    expect(type).toBe('DAILY');
  });

  it('should detect MP file type', async () => {
    const type = await validator.detectFileType(path.join(__dirname, '../../fixtures/SALES_MP_TEST.xlsx'));
    expect(type).toBe('MP');
  });

  it('should detect PRODUK file type', async () => {
    const type = await validator.detectFileType(path.join(__dirname, '../../fixtures/SALES_PRODUK_TEST.xlsx'));
    expect(type).toBe('PRODUK');
  });

  it('should validate valid headers', async () => {
    const result = await validator.validateHeaders(path.join(__dirname, '../../fixtures/SALES_DAILY_TEST.xlsx'), 'DAILY');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
