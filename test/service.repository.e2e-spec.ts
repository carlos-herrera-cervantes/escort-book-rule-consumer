import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiceModule } from '../src/service/service.module';
import { MongoClient } from '../src/config/mongo.config';
import { ServiceRepository } from '../src/service/service.repository';

let app: INestApplication;
let serviceRepository: ServiceRepository;

beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      MongooseModule.forRoot(MongoClient.Uri),
      ServiceModule,
    ],
  }).compile();

  app = module.createNestApplication();
  await app.init();

  serviceRepository = module.get<ServiceRepository>(ServiceRepository);
});

afterAll(async () => await app.close());

describe('ServiceRepository', () => {
  it('populateOne - Should return null', async () => {
    const service = await serviceRepository.populateOne();
    expect(service).toBeNull();
  });
});
