import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisConfig {
  constructor(private configService: ConfigService) {}

  createRedisClient(): Redis {
    const password = this.configService.get<string>('REDIS_PASSWORD');
    
    const redisConfig: any = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      db: this.configService.get<number>('REDIS_DB', 0),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      keepAlive: 30000,
      family: 4, // IPv4
    };

    // Only add password if it's actually configured
    if (password) {
      redisConfig.password = password;
    }

    console.log('Connecting to Redis with config:', redisConfig);
    

    const redis = new Redis(redisConfig);

    redis.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    redis.on('ready', () => {
      console.log('✅ Redis is ready');
    });

    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });

    redis.on('close', () => {
      console.log('🔌 Redis connection closed');
    });

    redis.on('reconnecting', () => {
      console.log('🔄 Reconnecting to Redis...');
    });

    return redis;
  }
}