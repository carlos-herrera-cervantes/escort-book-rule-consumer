class ScheduleExpression {
  cron: string;
}

class JobOptions {
  repeat: ScheduleExpression;
}

class JobMetadata {
  name: string;
  options: JobOptions;
}

export class Job {
  metadata: JobMetadata;
}