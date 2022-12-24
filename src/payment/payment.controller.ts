import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { KafkaTopic } from '../config/kafka.config';
import { PaymentStartedDto } from './dto/payment-started.dto';
import { RedisService } from '../redis/redis.service';
import { PaymentService } from './payment.service';
import '../extensions/string.extension';
import '../extensions/date.extension';

@Controller()
export class PaymentController {
  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(PaymentService)
  private readonly paymentService: PaymentService;

  private readonly logger = new Logger(PaymentController.name);

  @MessagePattern(KafkaTopic.ServiceStarted)
  async scheduleReleasePayment(@Payload() message: PaymentStartedDto): Promise<void> {
    const shortDate = message.scheduleExpression.toShortDateString();
    const payload = {
      [message.serviceId]: message.userType,
    };
    await this.redisService.setHash(shortDate, payload).catch((err) => {
      this.logger.error(`Imposible schedule service: ${message.serviceId}`);
      this.logger.error(err);
    });
  }

  @Cron('* * * * *')
  async execReleasePayment(): Promise<void> {
    const now = new Date();
    const key = now.toShortDateString();
    const releases = await this.redisService.getHash(key);
    const noKeys = !Object.keys(releases).length;

    if (noKeys) {
      this.logger.log('No payments to release');
      return;
    }

    for (const [key, value] of Object.entries(releases)) {
      await this.paymentService
        .releasePayment(key, value as string)
        .catch((err) => {
          this.logger.error('Error releasing payment');
          this.logger.error(err);
        });
    }

    await this.redisService.deleteHash(key);
  }
}
