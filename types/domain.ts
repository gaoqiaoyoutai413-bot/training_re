export type UserRole = "student" | "mentor" | "admin";
export type AccountStatus = "active" | "inactive" | "retired";
export type TaskCategory =
  | "internal_ops"
  | "customer_engagement"
  | "knowledge_management"
  | "data_optimization";
export type SubmissionStatus =
  | "not_started"
  | "submitted"
  | "ai_reviewed"
  | "mentor_reviewed"
  | "passed"
  | "rework_requested";

export type SkillKey = "automation" | "ai" | "integration";

export type SkillScores = Record<SkillKey, number>;

export interface TaskDependency {
  taskCode: string;
  reason: string;
}

export interface AcceptanceCriteria {
  mustHave: string[];
  minimumErrorHandling: string[];
  requiredSubmissionItems: string[];
}

export interface AiReviewCriterion {
  title: string;
  description: string;
}

export interface AiReviewFinding {
  severity: "high" | "medium" | "low";
  category: "security" | "readability" | "business_logic";
  title: string;
  detail: string;
  suggestion: string;
}

export interface AiAcceptanceCheck {
  label: string;
  status: "met" | "partial" | "missing" | "unclear";
  comment: string;
}

export interface AiReviewRecord {
  modelName: string;
  promptVersion: string;
  securityScore: number;
  readabilityScore: number;
  businessLogicScore: number;
  overallAssessment: "strong" | "borderline" | "needs_revision" | "major_revision";
  assessmentReason: string;
  summary: string;
  acceptanceChecks: AiAcceptanceCheck[];
  findings: AiReviewFinding[];
  mentorFlags: string[];
  reviewedAt: string;
}

export interface MentorEvaluationSheet {
  technicalPointLabel: string;
  businessPointLabel: string;
  returnReasons: string[];
  commentTemplate: string;
}

export interface StarterKitFile {
  label: string;
  path: string;
  description: string;
}

export interface StarterKit {
  title: string;
  description: string;
  setupSteps: string[];
  files: StarterKitFile[];
}

export interface Task {
  id: string;
  taskCode: string;
  version: number;
  title: string;
  summary: string;
  category: TaskCategory;
  difficulty: 1 | 2 | 3 | 4;
  estimatedHours: number;
  skills: SkillScores;
  learningObjective: string;
  learnerActions: string[];
  deliverables: string[];
  businessImpact: string;
  background?: string;
  specificIssue?: string;
  finalGoal?: string;
  starterKit?: StarterKit;
  recommendedDependencies: TaskDependency[];
  rubricHighlights: string[];
  businessValueChecks: string[];
  acceptanceCriteria: AcceptanceCriteria;
  aiReviewRubric: AiReviewCriterion[];
  mentorEvaluationSheet: MentorEvaluationSheet;
}

export interface Submission {
  id: string;
  taskCode: string;
  taskTitle?: string | null;
  userId?: string;
  userName: string;
  batchCode: string | null;
  submittedAt: string;
  status: SubmissionStatus;
  sourceCodeUrl: string;
  businessValueText: string;
  assignedMentorId?: string | null;
  assignedMentorName?: string | null;
  technicalScore?: number;
  businessScore?: number;
  aiSummary?: string;
  driveFolderId?: string | null;
  driveExportStatus?: "pending" | "exported" | "failed" | null;
  driveExportedAt?: string | null;
  driveExportError?: string | null;
}

export interface SubmissionFileRecord {
  id: string;
  storagePath: string;
  fileType: string;
  mimeType: string | null;
  uploadedAt?: string;
  previewUrl?: string | null;
}

export interface SubmissionDetailRecord {
  submission: Submission;
  taskTitle: string | null;
  files: SubmissionFileRecord[];
  aiReview: AiReviewRecord | null;
  mentorReview: MentorReviewRecord | null;
}

export interface LearnerSnapshot {
  id: string;
  name: string;
  email: string;
  batchCode: string | null;
  role: UserRole;
  accountStatus?: AccountStatus;
  assignedMentorId?: string | null;
  assignedMentorName?: string | null;
  submissionCount?: number;
  completedTasks: number;
  inReviewTasks: number;
  skillScores: SkillScores;
  focusArea: string;
}

export interface MentorReviewDraft {
  submissionId: string;
  technicalScore: number;
  businessScore: number;
  result: "passed" | "rework_requested";
  comment: string;
  strengths: string[];
  concerns: string[];
}

export interface MentorReviewRecord {
  submissionId: string;
  technicalScore: number;
  businessScore: number;
  result: "passed" | "rework_requested";
  comment: string;
  reviewerName: string;
  reviewedAt: string;
}

export interface BatchSummary {
  code: string;
  label: string;
  learners: number;
  completionRate: number;
  averageClearDays: number;
  pendingReviews: number;
}

export interface KnowledgeEntry {
  id: string;
  submissionId: string;
  taskCode: string;
  taskTitle?: string | null;
  title: string;
  author: string;
  summary: string;
  highlights: string[];
  sourceCodeUrl?: string | null;
  publishedAt?: string;
}

export interface KnowledgeTaskGroup {
  taskCode: string;
  taskTitle: string | null;
  entryCount: number;
  latestPublishedAt: string | null;
  latestSummary: string;
  highlights: string[];
}

export interface KnowledgeImageAsset {
  id: string;
  url: string;
  mimeType: string | null;
  label: string;
}

export interface KnowledgeEntryDetail {
  id: string;
  submissionId: string;
  taskCode: string;
  taskTitle: string | null;
  title: string;
  summary: string;
  highlights: string[];
  readme: string;
  mentorComment: string | null;
  mentorResult: "passed" | "rework_requested" | null;
  sourceCodeUrl: string | null;
  publishedAt: string | null;
  images: KnowledgeImageAsset[];
}

export interface DashboardMetrics {
  completedTasks: number;
  inReview: number;
  recommendedTaskCode: string;
  recommendedReason: string;
  skillScores: SkillScores;
}
