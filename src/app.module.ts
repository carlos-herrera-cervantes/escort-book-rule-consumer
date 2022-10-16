import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentModule } from './payment/payment.module';
import { RedisModule } from './redis/redis.module';
import { ServiceModule } from './service/service.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_DB_URI),
    ScheduleModule.forRoot(),
    RedisModule,
    PaymentModule,
    ServiceModule,
  ],
})
export class AppModule {}
