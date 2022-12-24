export enum KafkaTopic {
  ServiceStarted = 'service-started',
  CustomerReleasePayment = 'escort-book-customer-release-payment',
  EscortReleasePayment = 'escort-book-escort-release-payment'
}

export const KafkaClient = {
  Brokers: process.env.KAFKA_BROKERS,
  GroupId: process.env.KAFKA_GROUP_ID,
}
