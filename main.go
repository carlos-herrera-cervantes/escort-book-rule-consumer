package main

import (
	"context"
	"escort-book-rule-consumer/handlers"
	"escort-book-rule-consumer/services"
	"log"
	"os"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	_ "github.com/joho/godotenv/autoload"
)

func main() {
	consumer, _ := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  os.Getenv("KAFKA_SERVERS"),
		"group.id":           os.Getenv("KAFKA_GROUP_ID"),
		"auto.offset.reset":  "smallest",
		"enable.auto.commit": true,
	})
	consumer.Subscribe(os.Getenv("KAFKA_RULE_TOPIC"), nil)
	handler := handlers.RuleHandler{
		EventBridgeService: &services.EventBridgeService{},
	}

	run := true

	for run {
		ev := consumer.Poll(0)

		switch e := ev.(type) {
		case *kafka.Message:
			handler.ProcessMessage(context.Background(), e)
			log.Println("PROCESSED MESSAGE")
		case kafka.PartitionEOF:
			log.Println("REACHED: ", e)
		case kafka.Error:
			log.Println("ERROR: ", e)
			run = false
		default:
		}
	}

	consumer.Close()
}
