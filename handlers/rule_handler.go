package handlers

import (
	"context"
	"encoding/json"
	"escort-book-rule-consumer/services"
	"escort-book-rule-consumer/types"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/eventbridge"
	"github.com/aws/aws-sdk-go/service/lambda"
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

type RuleHandler struct {
	EventBridgeService *services.EventBridgeService
}

func (h *RuleHandler) ProcessMessage(ctx context.Context, message *kafka.Message) {
	value := message.Value
	var ruleEvent types.RuleEvent

	json.Unmarshal(value, &ruleEvent)

	putRuleInput := eventbridge.PutRuleInput{
		Name:               aws.String(fmt.Sprintf("%s-%s", ruleEvent.UserType, ruleEvent.ServiceId)),
		Description:        aws.String(ruleEvent.ServiceId),
		State:              aws.String("ENABLED"),
		ScheduleExpression: aws.String(ruleEvent.ScheduleExpression),
	}

	putRuleOutput, err := h.EventBridgeService.PutRule(ctx, &putRuleInput)

	if err != nil {
		log.Println("ERROR PUTTING AN EVENT: ", err.Error())
		return
	}

	addPermissionInput := lambda.AddPermissionInput{
		Action:       aws.String("lambda:InvokeFunction"),
		FunctionName: aws.String(os.Getenv("LAMBDA")),
		Principal:    aws.String("events.amazonaws.com"),
		SourceArn:    aws.String(*putRuleOutput.RuleArn),
		StatementId:  aws.String(*putRuleInput.Name),
	}

	_, err = h.EventBridgeService.SetLambdaPermissions(ctx, &addPermissionInput)

	if err != nil {
		log.Println("ERROR SETTING PERMISSIONS TO LAMBDA: ", err.Error())
		return
	}

	putTargetInput := eventbridge.PutTargetsInput{
		Rule: aws.String(*putRuleInput.Name),
		Targets: []*eventbridge.Target{
			{Id: aws.String(os.Getenv("LAMBDA")), Arn: aws.String(os.Getenv("LAMBDA_ARN"))},
		},
	}

	_, err = h.EventBridgeService.TargetRuleToLambda(ctx, &putTargetInput)

	if err != nil {
		log.Println("ERROR TARGETING LAMBDA: ", err.Error())
	}
}
