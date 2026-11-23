// redis/redis.module.ts
import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';

@Global() // Để có thể dùng ở mọi nơi mà không cần import lại
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST as string, // Hoặc dùng process.env.REDIS_HOST
          port: Number(process.env.REDIS_PORT),
        });
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}