import { Inject, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { ClientKafka } from '@nestjs/microservices';
import { ServiceRepository } from '../service/service.repository';
import { PaymentRepository } from './payment.repository';
import { CreatePayment } from './dto/payment.dto';
import { PaymentDetail } from './schemas/payment-detail.schema';
import { ServiceStatus } from '../enums/service.enum';
import { UserType } from '../enums/user.enum';
import { KafkaTopic } from '../config/kafka.config';
import { ServiceDocument } from '../service/schemas/service.schema';

@Injectable()
export class PaymentService {
  @Inject(PaymentRepository)
  private readonly paymentRepository: PaymentRepository;

  @Inject(ServiceRepository)
  private readonly serviceRepository: ServiceRepository;

  @Inject('SlackMessenger')
  private readonly kafkaClient: ClientKafka;

  private readonly logger = new Logger(PaymentService.name);

  private invalidService(serviceDocument: ServiceDocument): boolean {
    return !serviceDocument || serviceDocument.status != ServiceStatus.Started;
  }

  private findCardId(paymentDetails: PaymentDetail[]): Types.ObjectId | null {
    return paymentDetails
      ?.filter((detail: PaymentDetail) => detail.cardId)
      ?.pop()
      ?.cardId;
  }

  async releasePayment(serviceId: string, userType: string): Promise<void> {
    const serviceDocument = await this.serviceRepository.populateOne(
      { _id: serviceId },
      { path: 'paymentDetails', populate: { path: 'paymentMethodId' } },
    )

    if (this.invalidService(serviceDocument)) {
      this.logger.warn(
        `Service ID: ${serviceId} does not exist or has an invalid status`
      );
      return;
    }

    const paymentDetails = serviceDocument.paymentDetails as PaymentDetail[];
    const cardId = this.findCardId(paymentDetails);

    if (!cardId) {
      this.logger.log(`The service ${serviceId} does not have a card payment method`);
      return;
    }

    const kafkaMessage = JSON.stringify({'serviceId': serviceId});

    if (userType == UserType.Customer) {
      this.kafkaClient.emit(KafkaTopic.CustomerReleasePayment, kafkaMessage);
      return;
    }

    const payment: CreatePayment = {
      escortId: serviceDocument.escortId,
      customerId: serviceDocument.customerId,
      serviceId: serviceDocument._id,
      cardId,
    };

    serviceDocument.status = ServiceStatus.Completed;

    await Promise.all([
      this.paymentRepository.create(payment),
      serviceDocument.save(),
    ]);

    this.kafkaClient.emit(KafkaTopic.EscortReleasePayment, kafkaMessage);
  }
}
