import { Worker, Job } from 'bullmq';
import { redisConfig } from '../config/redis';
import { QUEUE_NAMES, JOB_NAMES } from '../queues/queue.constants';
import { publishProgress } from '../modules/import/sse/sse.service';
import { importQueue } from '../queues/import.queue';

import { TransformationService } from '../modules/transformation/transformation.service';
import { ProductResolver } from '../modules/transformation/resolvers/product.resolver';
import { PlatformResolver } from '../modules/transformation/resolvers/platform.resolver';
import { StoreResolver } from '../modules/transformation/resolvers/store.resolver';
import { AdminResolver } from '../modules/transformation/resolvers/admin.resolver';
import { AdvertiserResolver } from '../modules/transformation/resolvers/advertiser.resolver';
import { RegionResolver } from '../modules/transformation/resolvers/region.resolver';
import { PromoResolver } from '../modules/transformation/resolvers/promo.resolver';
import { HppResolver } from '../modules/transformation/resolvers/hpp.resolver';
import { PaymentTypeResolver } from '../modules/transformation/resolvers/payment-type.resolver';
import { DateResolver } from '../modules/transformation/resolvers/date.resolver';

import { productRepository } from '../modules/product/product.repository';
import { platformRepository } from '../modules/platform/platform.repository';
import { storeRepository } from '../modules/store/store.repository';
import { adminRepository } from '../modules/admin/admin.repository';
import { advertiserRepository } from '../modules/advertiser/advertiser.repository';
import { regionRepository } from '../modules/region/region.repository';
import { priceRuleRepository } from '../modules/price-rule/price-rule.repository';

interface TransformJobData {
  sessionId: string;
}

export const transformDataProcessor = async (job: Job<TransformJobData>) => {
    if (job.name !== JOB_NAMES.TRANSFORM_DATA) return;
    
    const { sessionId } = job.data;
    
    await publishProgress(sessionId, {
      type: 'status_change',
      status: 'transforming',
      message: 'Starting data transformation...',
    });
    
    const service = new TransformationService(
      new ProductResolver(productRepository),
      new PlatformResolver(platformRepository),
      new StoreResolver(storeRepository),
      new AdminResolver(adminRepository),
      new AdvertiserResolver(advertiserRepository),
      new RegionResolver(regionRepository),
      new PromoResolver(),
      new HppResolver(priceRuleRepository),
      new PaymentTypeResolver(platformRepository),
      new DateResolver()
    );

    const result = await service.transformSession(sessionId, (current, total) => {
      publishProgress(sessionId, {
        type: 'progress',
        step: 'transforming',
        message: `Transformed ${current}/${total} rows...`,
      });
    });
    
    await importQueue.add(JOB_NAMES.GENERATE_OUTPUT, { sessionId });
    
    return result;
};
