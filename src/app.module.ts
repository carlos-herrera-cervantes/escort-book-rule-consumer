import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { MongoClient } from './config/mongo.config';
import { PaymentModule } from './payment/payment.module';
import { RedisModule } from './redis/redis.module';
import { ServiceModule } from './service/service.module';

@Module({
  imports: [
    MongooseModule.forRoot(MongoClient.Uri),
    ScheduleModule.forRoot(),
    RedisModule,
    PaymentModule,
    ServiceModule,
  ],
})
export class AppModule {}
