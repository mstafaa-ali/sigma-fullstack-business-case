import { Knex } from 'knex';
import { db } from '../../config/database';

export class TransactionManager {
  static async run<T>(
    callback: (trx: Knex.Transaction) => Promise<T>
  ): Promise<T> {
    const trx = await db.transaction();
    try {
      const result = await callback(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}
