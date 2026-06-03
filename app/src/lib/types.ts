/**
 * テスプラ - ドメイン型定義
 */

export type SubjectId =
  | 'jp'    // 国語
  | 'math'  // 数学
  | 'en'    // 英語
  | 'sci'   // 理科
  | 'soc'   // 社会
  | 'music' // 音楽
  | 'art'   // 美術
  | 'pe'    // 保健体育
  | 'tech'  // 技術
  | 'home'; // 家庭

export interface Subject {
  id: SubjectId | string;
  label: string;
  color: string; // CSS color
}

/** 1日に複数回ぶんの勉強配分。同じ科目を複数行に分けても可 */
export interface StudyBlock {
  id: SubjectId | string;
  mins: number;
  /** どのように計画に入ったか（自動 / 手動） */
  source?: 'auto' | 'manual';
}

/** 計画作成時の自動配分設定 */
export interface AutoSettings {
  /** 平日の勉強時間（分） */
  weekdayMins: number;
  /** 平日（部活ありの日）の勉強時間（分） */
  weekdayClubMins: number;
  /** 休日の勉強時間（分） */
  weekendMins: number;
  /** 部活がある曜日 0=Sun..6=Sat */
  clubDays: number[];
  /** テスト1週間前は部活なし扱い */
  noClubBeforeTest: boolean;
}

/** ISO 日付 YYYY-MM-DD */
export type ISODate = string;

export interface TestPlan {
  id: string;
  testName: string;
  startDate: ISODate;
  endDate: ISODate;
  subjects: (SubjectId | string)[];
  /** 各テスト日の科目 */
  testDaySubjects: Record<ISODate, (SubjectId | string)[]>;
  /** 各勉強日の配分 */
  studyDays: Record<ISODate, StudyBlock[]>;
  /** 自動設定（ある場合） */
  autoSettings?: AutoSettings;
  /** カスタム科目のラベル情報 */
  customSubjects?: { id: string; label: string }[];
  /** 結果（テスト後） */
  result?: TestResult;
  createdAt: string;
  updatedAt: string;
}

export interface TestResult {
  /** SubjectId → 点数 (0-100) */
  scores: Record<string, number>;
  /** ふりかえりメモ */
  memo?: string;
  recordedAt: string;
}

export interface User {
  id: string;
  email: string;
}
