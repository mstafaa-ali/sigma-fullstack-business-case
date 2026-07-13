import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { ImportRepository } from '../../src/modules/import/import.repository';
import knexConfig from '../../knexfile';
import knex from 'knex';

describe('ImportRepository Integration', () => {
  const db = knex(knexConfig);
  const repo = new ImportRepository();

  beforeAll(async () => {
    // Clean up before tests
    await db('import_logs').del();
    await db('sales_raw').del();
    await db('import_sessions').del();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should create and retrieve a session', async () => {
    const session = await repo.create({
      status: 'pending',
      file_names: '["test.xlsx"]'
    });

    expect(session.id).toBeDefined();
    
    const retrieved = await repo.findById(session.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.status).toBe('pending');

    await repo.updateSession(session.id, { status: 'completed' });
    const updated = await repo.findById(session.id);
    expect(updated?.status).toBe('completed');
  });

  it('should create and retrieve logs', async () => {
    const session = await repo.create({
      status: 'pending',
      file_names: '["test.xlsx"]'
    });

    await repo.createLog({
      session_id: session.id,
      file_name: 'test.xlsx',
      row_number: 1,
      log_level: 'error',
      message: 'Test error'
    });

    const logs = await repo.getLogsBySessionId(session.id);
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('Test error');
  });
});
