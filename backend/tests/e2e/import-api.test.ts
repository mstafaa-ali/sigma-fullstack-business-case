import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app'; // assuming src/app.ts exports the Express app
import path from 'path';

describe('Import API (E2E)', () => {
  it('should return 400 if less than 3 files uploaded', async () => {
    const res = await request(app)
      .post('/api/import/upload')
      .attach('files', path.join(__dirname, '../fixtures/SALES_DAILY_TEST.xlsx'), { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 202 and session id if 3 files uploaded', async () => {
    const res = await request(app)
      .post('/api/import/upload')
      .attach('files', path.join(__dirname, '../fixtures/SALES_DAILY_TEST.xlsx'), { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      .attach('files', path.join(__dirname, '../fixtures/SALES_MP_TEST.xlsx'), { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      .attach('files', path.join(__dirname, '../fixtures/SALES_PRODUK_TEST.xlsx'), { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
    expect(res.status).toBe(202);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sessionId).toBeDefined();
  });

  it('should list sessions', async () => {
    const res = await request(app).get('/api/import/sessions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 404 for invalid session', async () => {
    const res = await request(app).get('/api/import/sessions/00000000-0000-0000-0000-000000000000');
    expect(res.status).toBe(404);
  });
});
