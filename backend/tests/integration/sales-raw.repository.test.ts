import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SalesRawRepository } from '../../src/modules/sales/sales-raw.repository';
import { ImportRepository } from '../../src/modules/import/import.repository';
import knexConfig from '../../knexfile';
import knex from 'knex';

describe('SalesRawRepository Integration', () => {
  const db = knex(knexConfig);
  const repo = new SalesRawRepository();
  const importRepo = new ImportRepository();
  let sessionId: string;

  beforeAll(async () => {
    await db('sales_raw').del();
    await db('import_sessions').del();

    const session = await importRepo.create({ status: 'pending', file_names: '[]' });
    sessionId = session.id;
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should bulk upsert and retrieve data', async () => {
    await repo.bulkUpsert([{
      session_id: sessionId,
      file_type: 'DAILY',
      row_number: 1,
      invoice_number: 'INV-001',
      status: 'pending'
    }]);

    const result = await repo.findBySessionId(sessionId);
    expect(result.total).toBe(1);
    expect(result.data[0].invoice_number).toBe('INV-001');

    // Test upsert conflict
    await repo.bulkUpsert([{
      session_id: sessionId,
      file_type: 'DAILY',
      row_number: 1,
      invoice_number: 'INV-002',
      status: 'validated'
    }]);

    const resultAfterUpsert = await repo.findBySessionId(sessionId);
    expect(resultAfterUpsert.total).toBe(1); // Still 1 because row_number conflicts
    expect(resultAfterUpsert.data[0].invoice_number).toBe('INV-002');
  });
});
