import type { ResumeAnalysisResult } from "./ai-analyzer";

export type ApplicationStage =
  | "applied"
  | "resume_uploaded"
  | "interview_pending"
  | "interview_in_progress"
  | "interview_completed";

export type InterviewLanguage = "en" | "hi" | "hinglish";

export interface ApplicationResume {
  fileName: string;
  uploadedAt: string;
  parsedSummary?: string;
  resumeText?: string;
  analysisResult?: ResumeAnalysisResult;
}

export interface ApplicationConsent {
  acceptedAt: string;
}

export interface ApplicationResultSummary {
  overallScore: number;
  fitVerdict?: string;
  completedAt?: string;
  scorecard?: unknown;
}

export interface ApplicationInterviewProgress {
  currentIdx: number;
  answers: Record<string, string>;
  durations: Record<string, number>;
  sessionSeconds?: number;
}

export interface ApplicationRecord {
  id: string;
  jobId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  stage: ApplicationStage;
  resume: ApplicationResume;
  language: InterviewLanguage;
  consent: ApplicationConsent | null;
  interviewSessionId: string | null;
  resultSummary: ApplicationResultSummary | null;
  interviewProgress?: ApplicationInterviewProgress;
}

const STORAGE_KEY_PREFIX = "hiresense_applications_";
const EVENT_NAME = "hiresense_applications_changed";

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId || "anonymous"}`;
}

function notifySubscribers(userId: string, jobId: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { userId, jobId },
      }),
    );
  }
}

/**
 * Remove all local applications from storage so user can test completely fresh.
 */
export function clearAllLocalApplications(): void {
  if (typeof window === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn("Could not clear local applications:", err);
  }
}

/**
 * Retrieve all applications for a user.
 */
export function listApplications(userId: string): ApplicationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read applications from storage:", err);
    return [];
  }
}

/**
 * Retrieve a specific application for a user & job.
 */
export function getApplication(userId: string, jobId: string): ApplicationRecord | null {
  if (!jobId) return null;
  const list = listApplications(userId);
  return list.find((item) => item.jobId === jobId) || null;
}

/**
 * Synchronously scan local storage for an application record matching a jobId.
 * Checks preferredUserId first, then guest_user, then all stored application keys.
 */
export function findApplicationForJob(
  jobId: string,
  preferredUserId?: string,
): ApplicationRecord | null {
  if (typeof window === "undefined" || !jobId) return null;

  if (preferredUserId) {
    const app = getApplication(preferredUserId, jobId);
    if (app) return app;
  }

  const guestApp = getApplication("guest_user", jobId);
  if (guestApp) return guestApp;

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const match = list.find(
              (item: ApplicationRecord) => item && item.jobId === jobId,
            );
            if (match) return match;
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not scan applications for job:", err);
  }

  return null;
}

/**
 * Save or update an application record. Idempotent and persists to localStorage.
 */
export function saveApplication(record: ApplicationRecord): ApplicationRecord {
  if (typeof window === "undefined") return record;
  try {
    const key = getStorageKey(record.userId);
    const existing = listApplications(record.userId);
    const index = existing.findIndex((item) => item.jobId === record.jobId);
    const updatedRecord: ApplicationRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      existing[index] = updatedRecord;
    } else {
      existing.push(updatedRecord);
    }

    localStorage.setItem(key, JSON.stringify(existing));
    notifySubscribers(record.userId, record.jobId);
    return updatedRecord;
  } catch (err) {
    console.warn("Could not save application to storage:", err);
    return record;
  }
}

/**
 * Step 1: Record when candidate opens job application.
 */
export function recordJobOpened(userId: string, jobId: string): ApplicationRecord {
  const existing = getApplication(userId, jobId);
  if (existing) return existing;

  const newRecord: ApplicationRecord = {
    id: `app_${jobId}_${Date.now()}`,
    jobId,
    userId: userId || "anonymous",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stage: "applied",
    resume: {
      fileName: "",
      uploadedAt: "",
    },
    language: "en",
    consent: null,
    interviewSessionId: null,
    resultSummary: null,
  };

  return saveApplication(newRecord);
}

/**
 * Step 2: Record when resume is uploaded and parsed.
 */
export function recordResumeUploaded(
  userId: string,
  jobId: string,
  resumeData: {
    fileName: string;
    resumeText?: string;
    parsedSummary?: string;
    analysisResult?: ResumeAnalysisResult;
    uploadedAt?: string;
  },
  language?: InterviewLanguage,
): ApplicationRecord {
  const existing = getApplication(userId, jobId) || recordJobOpened(userId, jobId);

  const updated: ApplicationRecord = {
    ...existing,
    language: language || existing.language || "en",
    stage:
      existing.stage === "interview_completed"
        ? "interview_completed"
        : existing.stage === "interview_in_progress"
          ? "interview_in_progress"
          : "resume_uploaded",
    resume: {
      fileName: resumeData.fileName,
      uploadedAt: new Date().toISOString(),
      resumeText: resumeData.resumeText || existing.resume.resumeText,
      parsedSummary: resumeData.parsedSummary || existing.resume.parsedSummary,
      analysisResult: resumeData.analysisResult || existing.resume.analysisResult,
    },
  };

  return saveApplication(updated);
}

/**
 * Step 3: Record consent acceptance and language choice.
 */
export function recordConsentAndLanguage(
  userId: string,
  jobId: string,
  language: InterviewLanguage,
): ApplicationRecord {
  const existing = getApplication(userId, jobId) || recordJobOpened(userId, jobId);

  const updated: ApplicationRecord = {
    ...existing,
    language,
    consent: {
      acceptedAt: new Date().toISOString(),
    },
    stage:
      existing.stage === "interview_completed"
        ? "interview_completed"
        : existing.stage === "interview_in_progress"
          ? "interview_in_progress"
          : "interview_pending",
  };

  return saveApplication(updated);
}

/**
 * Step 4: Record interview start.
 */
export function recordInterviewStarted(
  userId: string,
  jobId: string,
  sessionId?: string,
): ApplicationRecord {
  const existing = getApplication(userId, jobId) || recordJobOpened(userId, jobId);

  const updated: ApplicationRecord = {
    ...existing,
    stage:
      existing.stage === "interview_completed" ? "interview_completed" : "interview_in_progress",
    interviewSessionId: sessionId || existing.interviewSessionId || `session_${Date.now()}`,
    interviewProgress: existing.interviewProgress || {
      currentIdx: 0,
      answers: {},
      durations: {},
      sessionSeconds: 0,
    },
  };

  return saveApplication(updated);
}

/**
 * Autosave interview in progress (answers & timer).
 */
export function recordInterviewProgress(
  userId: string,
  jobId: string,
  progress: ApplicationInterviewProgress,
): ApplicationRecord {
  const existing = getApplication(userId, jobId) || recordJobOpened(userId, jobId);

  const updated: ApplicationRecord = {
    ...existing,
    stage:
      existing.stage === "interview_completed" ? "interview_completed" : "interview_in_progress",
    interviewProgress: {
      ...existing.interviewProgress,
      ...progress,
    },
  };

  return saveApplication(updated);
}

/**
 * Step 5: Record interview completion and overall score.
 */
export function recordInterviewCompleted(
  userId: string,
  jobId: string,
  result:
    | ApplicationResultSummary
    | { overallScore: number; fitVerdict?: string; [key: string]: unknown },
): ApplicationRecord {
  const existing = getApplication(userId, jobId) || recordJobOpened(userId, jobId);

  const updated: ApplicationRecord = {
    ...existing,
    stage: "interview_completed",
    resultSummary: {
      overallScore: result.overallScore,
      fitVerdict: "fitVerdict" in result ? result.fitVerdict : undefined,
      completedAt:
        "completedAt" in result && typeof result.completedAt === "string"
          ? result.completedAt
          : new Date().toISOString(),
      scorecard: "scorecard" in result ? result.scorecard : result,
    },
  };

  return saveApplication(updated);
}

/**
 * Card status pill text (monochrome hairline style)
 */
export function getApplicationCardStatus(app: ApplicationRecord | null): string | null {
  if (!app) return null;
  switch (app.stage) {
    case "applied":
      return "Applied";
    case "resume_uploaded":
      return "Resume uploaded";
    case "interview_pending":
      return "Interview pending";
    case "interview_in_progress":
      return "Interview in progress";
    case "interview_completed":
      return `Interview completed · ${app.resultSummary?.overallScore ?? 0}/100`;
    default:
      return null;
  }
}

/**
 * Detail panel primary button text
 */
export function getApplicationCtaLabel(app: ApplicationRecord | null): string {
  if (!app) return "Apply now";
  switch (app.stage) {
    case "applied":
    case "resume_uploaded":
      return "Continue to interview";
    case "interview_pending":
      return "Start interview";
    case "interview_in_progress":
      return "Resume interview";
    case "interview_completed":
      return "View results";
    default:
      return "Apply now";
  }
}

/**
 * Four-step progress tracker configuration.
 * Steps: Applied · Resume · Interview · Results
 * Status dots: filled = done, half = current, hollow = upcoming
 */
export type StepDotState = "done" | "current" | "upcoming";

export interface TrackerStep {
  label: string;
  state: StepDotState;
}

export function getApplicationProgressTracker(app: ApplicationRecord | null): {
  steps: TrackerStep[];
  nextActionText: string;
} {
  const stepLabels = ["Applied", "Resume", "Interview", "Results"] as const;

  if (!app) {
    return {
      steps: stepLabels.map((label, idx) => ({
        label,
        state: idx === 0 ? "current" : "upcoming",
      })),
      nextActionText: "Not started yet. Apply to begin screening.",
    };
  }

  let states: [StepDotState, StepDotState, StepDotState, StepDotState];
  let nextActionText = "";

  switch (app.stage) {
    case "applied":
      states = ["done", "current", "upcoming", "upcoming"];
      nextActionText = "Application started. Next step: upload your resume.";
      break;
    case "resume_uploaded":
      states = ["done", "done", "current", "upcoming"];
      nextActionText = "Resume uploaded. Next step: your AI interview.";
      break;
    case "interview_pending":
      states = ["done", "done", "current", "upcoming"];
      nextActionText = "Screening complete. Next step: start your AI interview.";
      break;
    case "interview_in_progress":
      states = ["done", "done", "current", "upcoming"];
      nextActionText = "Interview in progress. Next step: complete remaining questions.";
      break;
    case "interview_completed": {
      states = ["done", "done", "done", "done"];
      const score = app.resultSummary?.overallScore;
      nextActionText =
        score !== undefined
          ? `Interview evaluated · Overall score: ${score}/100.`
          : "Interview completed. View your performance scorecard.";
      break;
    }
    default:
      states = ["current", "upcoming", "upcoming", "upcoming"];
      nextActionText = "Ready to start.";
  }

  return {
    steps: stepLabels.map((label, idx) => ({
      label,
      state: states[idx],
    })),
    nextActionText,
  };
}
