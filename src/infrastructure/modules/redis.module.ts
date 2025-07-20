import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisConfig } from '../config/redis.config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisConfig,
    {
      provide: 'REDIS_CLIENT',
      useFactory: (redisConfig: RedisConfig) => {
        return redisConfig.createRedisClient();
      },
      inject: [RedisConfig],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}