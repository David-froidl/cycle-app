export interface TimetableLesson {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  subject: string;
  room?: string;
  teacher?: string;
  cancelled: boolean;
  roomChanged: boolean;
  originalRoom?: string;
  note?: string;
}

export interface FreePeriod {
  afterIndex: number;
  startTime: string;
  endTime: string;
}

export interface DayTimetable {
  date: string;
  lessons: TimetableLesson[];
  freePeriods: FreePeriod[];
  isLongDay: boolean;
  lessonCount: number;
}

export type AssignmentType = "abgabe" | "pruefung";

export interface AssignmentEntry {
  id: string;
  type: AssignmentType;
  subject: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  note?: string;
  done: boolean;
  createdAt: string;
}

export type LearningBlockKind = "vorbereitung" | "wiederholung";

export interface LearningBlock {
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  kind: LearningBlockKind;
}

export type LearningPlanStatus = "ready" | "pending" | "error";

export interface LearningPlan {
  id: string;
  examId: string;
  subject: string;
  examDate: string;
  createdAt: string;
  status: LearningPlanStatus;
  blocks: LearningBlock[];
  error?: string;
  contentSourceNote?: string;
}

export interface EveningEntry {
  id: string;
  date: string; // YYYY-MM-DD, the day this entry is about
  dayDone: string;
  openItems: string;
  tomorrowLearning?: string;
  createdAt: string;
}

export interface GraphTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // epoch ms
  scope?: string;
}

export interface SubjectChannelMapping {
  subject: string;
  teamId: string;
  teamName?: string;
  channelId: string;
  channelName?: string;
}

export interface AppSettings {
  eveningRoutineEnabled: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  eveningRoutineEnabled: true,
};
