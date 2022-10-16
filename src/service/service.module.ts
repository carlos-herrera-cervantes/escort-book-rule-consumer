import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from './schemas/service.schema';
import { ServiceRepository } from './service.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Service.name, schema: ServiceSchema }
    ]),
  ],
  providers: [ServiceRepository],
  exports: [ServiceRepository],
})
export class ServiceModule {}
