package services

import (
	"context"
	"os"
	"sync"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/eventbridge"
	"github.com/aws/aws-sdk-go/service/lambda"
)

type IEventBridgeService interface {
	PutRule(ctx context.Context, input *eventbridge.PutRuleInput) (*eventbridge.PutRuleOutput, error)
	SetLambdaPermissions(ctx context.Context, input *lambda.AddPermissionInput) (*lambda.AddPermissionOutput, error)
	TargetRuleToLambda(ctx context.Context, input *eventbridge.PutTargetsInput) (*eventbridge.PutTargetsOutput, error)
}

type EventBridgeService struct{}

var lock = &sync.Mutex{}
var eventBridgeClient *eventbridge.EventBridge
var lambdaClient *lambda.Lambda

func getEventBridgeClient() *eventbridge.EventBridge {
	if eventBridgeClient == nil {
		lock.Lock()
		defer lock.Unlock()

		if eventBridgeClient == nil {
			ses, _ := session.NewSession(&aws.Config{
				Region:      aws.String(os.Getenv("REGION")),
				Credentials: credentials.NewStaticCredentials("na", "na", ""),
				Endpoint:    aws.String(os.Getenv("ENDPOINT")),
			})
			eventBridgeClient = eventbridge.New(ses)
		}
	}

	return eventBridgeClient
}

func getLambdaClient() *lambda.Lambda {
	if lambdaClient == nil {
		lock.Lock()
		defer lock.Unlock()

		if lambdaClient == nil {
			ses, _ := session.NewSession(&aws.Config{
				Region:      aws.String(os.Getenv("REGION")),
				Credentials: credentials.NewStaticCredentials("na", "na", ""),
				Endpoint:    aws.String(os.Getenv("ENDPOINT")),
			})
			lambdaClient = lambda.New(ses)
		}
	}

	return lambdaClient
}

func (s *EventBridgeService) PutRule(
	ctx context.Context,
	input *eventbridge.PutRuleInput,
) (*eventbridge.PutRuleOutput, error) {
	client := getEventBridgeClient()
	putRuleOutput, err := client.PutRuleWithContext(ctx, input)

	if err != nil {
		return nil, err
	}

	return putRuleOutput, nil
}

func (s *EventBridgeService) SetLambdaPermissions(
	ctx context.Context,
	input *lambda.AddPermissionInput,
) (*lambda.AddPermissionOutput, error) {
	client := getLambdaClient()
	addPermissionOutput, err := client.AddPermissionWithContext(ctx, input)

	if err != nil {
		return nil, err
	}

	return addPermissionOutput, nil
}

func (s *EventBridgeService) TargetRuleToLambda(
	ctx context.Context,
	input *eventbridge.PutTargetsInput,
) (*eventbridge.PutTargetsOutput, error) {
	client := getEventBridgeClient()
	putTargetOutput, err := client.PutTargetsWithContext(ctx, input)

	if err != nil {
		return nil, err
	}

	return putTargetOutput, nil
}
