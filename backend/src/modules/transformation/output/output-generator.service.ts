import { FinanceOutputGenerator } from './finance-output.generator';
import { MarketingOutputGenerator } from './marketing-output.generator';
import { SalesTransformedRepository } from '../../sales/sales-transformed.repository';

export class OutputGeneratorService {
  private financeGen: FinanceOutputGenerator;
  private marketingGen: MarketingOutputGenerator;

  constructor() {
    const repo = new SalesTransformedRepository();
    this.financeGen = new FinanceOutputGenerator(repo);
    this.marketingGen = new MarketingOutputGenerator(repo);
  }

  async generateFinance(sessionId: string): Promise<Buffer> {
    return this.financeGen.generate(sessionId);
  }

  async generateMarketing(sessionId: string): Promise<Buffer> {
    return this.marketingGen.generate(sessionId);
  }
}
