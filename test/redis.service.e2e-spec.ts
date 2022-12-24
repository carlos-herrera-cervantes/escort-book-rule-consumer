import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from '../src/redis/redis.module';
import { RedisService } from '../src/redis/redis.service';

let app: INestApplication;
let redisService: RedisService;

beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      RedisModule,
    ],
  }).compile();

  app = module.createNestApplication();
  await app.init();

  redisService = module.get<RedisService>(RedisService);
});

afterAll(async () => await app.close());

describe('RedisService', () => {
  it('CRUD - Should apply CRUD', async () => {
    const dummyKey = 'dummy-key';
    const dummyObject = { 'key1': 'value1' };

    await redisService.setHash(dummyKey, dummyObject);
    const getResultBeforeDelete = await redisService.getHash(dummyKey);

    expect(Object.keys(getResultBeforeDelete).length).toBeTruthy();

    await redisService.deleteHash(dummyKey);
    const getResultAfterDelete = await redisService.getHash(dummyKey);

    expect(Object.keys(getResultAfterDelete).length).toBeFalsy();
  });
});
