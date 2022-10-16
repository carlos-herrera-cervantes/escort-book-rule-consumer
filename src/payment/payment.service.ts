import { Inject, Injectable, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { ClientKafka } from '@nestjs/microservices';
import { ServiceRepository } from '../service/service.repository';
import { PaymentRepository } from './payment.repository';
import { PaymentDto } from './dto/payment.dto';
import { PaymentDetail } from './schemas/payment-detail.schema';
import { ServiceStatus } from '../enums/service.enum';
import { UserType } from '../enums/user.enum';
import { KafkaTopic } from '../config/kafka.config';

@Injectable()
export class PaymentService {
  @Inject(PaymentRepository)
  private readonly paymentRepository: PaymentRepository;

  @Inject(ServiceRepository)
  private readonly serviceRepository: ServiceRepository;

  @Inject('SlackMessenger')
  private readonly kafkaClient: ClientKafka;

  private readonly logger = new Logger(PaymentService.name);

  async releasePayment(serviceId: string, userType: string): Promise<void> {
    const serviceDocument = await this.serviceRepository.getOneAndPopulate(
      { _id: serviceId },
      { path: 'paymentDetails', populate: { path: 'paymentMethodId' } },
    )

    if (!serviceDocument || serviceDocument.status != ServiceStatus.Started) {
      this.logger.warn(
        `Service ID: ${serviceId} does not exist or has an invalid status: ${serviceDocument.status}`
      );
      return;
    }

    const paymentDetails = serviceDocument.paymentDetails as PaymentDetail[];
    let cardId = null;

    paymentDetails.forEach((detail: PaymentDetail) => {
      if (detail.cardId) {
        cardId = detail.cardId;
        return;
      }
    });

    if (!cardId) {
      this.logger.log(`The service ${serviceId} does not have a card payment method`);
      return;
    }

    const kafkaMessage = JSON.stringify({'serviceId': serviceId});

    if (userType == UserType.Customer) {
      this.kafkaClient.emit(KafkaTopic.CustomerReleasePayment, kafkaMessage);
      return;
    }

    const payment: PaymentDto = {
      escortId: new Types.ObjectId(serviceDocument.escortId),
      customerId: new Types.ObjectId(serviceDocument.customerId),
      serviceId: new Types.ObjectId(serviceDocument._id),
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
