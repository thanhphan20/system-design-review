export interface Requirements {
  dau: string;
  readWriteRatio: string;
  consistencyNeeds: string;
  latencySla: string;
  growthTargets: string;
}

export interface SessionSummary {
  id: number;
  createdAt: string;
}

export interface SessionDetail extends SessionSummary {
  mermaidSource: string;
  requirements: Requirements;
  critiqueText: string;
}

export interface ValidationError {
  field: string;
  message: string;
}
