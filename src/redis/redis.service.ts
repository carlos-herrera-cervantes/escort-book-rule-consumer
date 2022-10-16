import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly redisClient = createClient();

  private readonly logger = new Logger(RedisService.name);

  async onModuleInit(): Promise<void> {
    this.redisClient.on('error', (err) => {
      this.logger.error('Redis client error');
      this.logger.error(err);
    });
    await this.redisClient.connect();
  }

  async getHash(key: string): Promise<any> {
    return this.redisClient.hGetAll(key);
  }

  async setHash(key: string, obj: any): Promise<void> {
    await this.redisClient.hSet(key, obj);
  }

  async deleteHash(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
