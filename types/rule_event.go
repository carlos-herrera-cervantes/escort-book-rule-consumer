package types

type RuleEvent struct {
	ServiceId          string `json:"serviceId"`
	UserType           string `json:"userType"`
	ScheduleExpression string `json:"scheduleExpression"`
}
