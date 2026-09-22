import {
  pgTable,
  uuid,
  text,
  varchar,
  pgEnum,
  timestamp,
  boolean,
  integer,
  numeric,
  jsonb,
  smallint,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ========================
// ENUMS
// ========================

export const userRoleEnum = pgEnum("user_role", [
  "student",
  "teacher",
  "admin",
]);

export const languageEnum = pgEnum("language", ["ur", "ar", "en", "fr", "id"]);

export const planTypeEnum = pgEnum("plan_type", ["human_ai", "pure_ai"]);

export const courseTypeEnum = pgEnum("course_type", [
  "nazra",
  "hifz",
  "arabic",
  "aalim",
]);

export const aalimCategoryEnum = pgEnum("aalim_category", [
  "two_year",
  "four_year",
  "six_year",
  "eight_year",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "trial",
  "active",
  "paused",
  "cancelled",
]);

export const classStatusEnum = pgEnum("class_status", [
  "scheduled",
  "completed",
  "cancelled",
  "missed",
]);

export const lessonTypeEnum = pgEnum("lesson_type", [
  "nazra",
  "hifz_sabaq",
  "hifz_sabqi",
  "hifz_manzil",
  "arabic",
  "aalim",
]);

export const hifzTypeEnum = pgEnum("hifz_type", [
  "sabaq",
  "sabqi",
  "manzil",
]);

export const hifzStatusEnum = pgEnum("hifz_status", [
  "pending",
  "in_progress",
  "completed",
  "needs_revision",
]);

export const activityTypeEnum = pgEnum("activity_type", [
  "harf_drag",
  "harf_trace",
  "sound_match",
  "puzzle",
  "word_builder",
  "harakaat_game",
  "reading_race",
  "memory_game",
]);

export const chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);

export const certificateTypeEnum = pgEnum("certificate_type", [
  "course_complete",
  "level_complete",
  "hafiz",
  "aalim",
  "faazil",
]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "cancelled",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "class_reminder",
  "test_reminder",
  "hifz_revision",
  "payment_due",
  "badge_earned",
  "review_approved",
  "referral_converted",
  "match_request",
  "match_accepted",
  "match_rejected",
  "video_approved",
  "video_rejected",
  "new_message",
  "new_recording",
  "system",
]);

export const videoStatusEnum = pgEnum("video_status", [
  "pending",
  "approved",
  "rejected",
]);

export const matchStatusEnum = pgEnum("match_status", [
  "requested",
  "accepted",
  "rejected",
  "active",
  "completed",
]);

export const messageTypeEnum = pgEnum("message_type", ["text", "system"]);

export const darsCategoryEnum = pgEnum("dars_category", [
  "quran",
  "hadith",
  "fiqh",
  "seerah",
  "dua",
]);

export const agentTaskStatusEnum = pgEnum("agent_task_status", [
  "success",
  "error",
]);

/**
 * Review state for generated content. Nothing reaches the public site until a
 * human moves it to "published" — there is no timeout and no auto-publish path.
 */
export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "pending_review",
  "published",
  "rejected",
  "needs_revision",
]);

export const pointActionEnum = pgEnum("point_action", [
  "sabaq_complete",
  "sabqi_review",
  "manzil_review",
  "tajweed_check",
  "streak_bonus",
  "test_pass",
  "daily_login",
  "badge_earned",
  "circle_join",
  "referral",
]);

export const badgeTypeEnum = pgEnum("badge_type", [
  "first_sabaq",
  "first_juz",
  "five_juz",
  "ten_juz",
  "twenty_juz",
  "hafiz",
  "streak_7",
  "streak_30",
  "streak_100",
  "tajweed_star",
  "tajweed_master",
  "perfect_score",
  "early_bird",
  "night_owl",
  "social_learner",
  "quiz_champion",
  "dedicated_student",
]);

export const parentReportStatusEnum = pgEnum("parent_report_status", [
  "pending",
  "sent",
  "failed",
]);

export const circleStatusEnum = pgEnum("circle_status", [
  "upcoming",
  "live",
  "completed",
  "cancelled",
]);

export const scheduleRequestStatusEnum = pgEnum("schedule_request_status", [
  "pending",
  "approved",
  "suggested",
  "confirmed",
  "rejected",
]);

export const progressRatingEnum = pgEnum("progress_rating", [
  "excellent",
  "good",
  "needs_improvement",
]);

export const assignmentTypeEnum = pgEnum("assignment_type", [
  "test",
  "assignment",
]);

export const assignmentFrequencyEnum = pgEnum("assignment_frequency", [
  "daily",
  "weekly",
  "once",
]);

export const assignmentStatusEnum = pgEnum("assignment_status", [
  "pending",
  "submitted",
  "graded",
]);

export const complaintCategoryEnum = pgEnum("complaint_category", [
  "teacher",
  "schedule",
  "technical",
  "fees",
  "other",
]);

export const complaintStatusEnum = pgEnum("complaint_status", [
  "new",
  "in_review",
  "resolved",
]);

// ========================
// 1. USERS TABLE
// ========================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull().default("student"),
  preferredLanguage: languageEnum("preferred_language").notNull().default("ur"),
  isBanned: boolean("is_banned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 2. STUDENT_PROFILES TABLE
// ========================

export const studentProfiles = pgTable("student_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  age: smallint("age"),
  country: varchar("country", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  parentName: varchar("parent_name", { length: 255 }),
  parentPhone: varchar("parent_phone", { length: 20 }),
  parentWhatsapp: varchar("parent_whatsapp", { length: 20 }),
  planType: planTypeEnum("plan_type"),
  classesPerWeek: smallint("classes_per_week"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 3. COURSES TABLE
// ========================

export const courses = pgTable("courses", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  nameUr: varchar("name_ur", { length: 255 }).notNull(),
  nameAr: varchar("name_ar", { length: 255 }).notNull(),
  nameEn: varchar("name_en", { length: 255 }).notNull(),
  nameFr: varchar("name_fr", { length: 255 }).notNull(),
  nameId: varchar("name_id", { length: 255 }).notNull(),
  descriptionUr: text("description_ur"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  descriptionFr: text("description_fr"),
  descriptionId: text("description_id"),
  courseType: courseTypeEnum("course_type").notNull(),
  durationMonths: integer("duration_months"),
  pricePlan1Monthly: numeric("price_plan1_monthly", {
    precision: 10,
    scale: 2,
  }),
  pricePlan2Monthly: numeric("price_plan2_monthly", {
    precision: 10,
    scale: 2,
  }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 4. AALIM_COURSE_CATEGORIES TABLE
// ========================

export const aalimCourseCategories = pgTable("aalim_course_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  categoryName: aalimCategoryEnum("category_name").notNull(),
  pricePlan1: numeric("price_plan1", { precision: 10, scale: 2 }),
  pricePlan2: numeric("price_plan2", { precision: 10, scale: 2 }),
  description: text("description"),
});

// ========================
// 5. ENROLLMENTS TABLE
// ========================

export const enrollments = pgTable("enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  planType: planTypeEnum("plan_type").notNull(),
  classesPerWeek: smallint("classes_per_week"),
  aalimCategory: aalimCategoryEnum("aalim_category"),
  status: enrollmentStatusEnum("status").notNull().default("trial"),
  trialStartDate: timestamp("trial_start_date", { withTimezone: true }),
  trialEndDate: timestamp("trial_end_date", { withTimezone: true }),
  subscriptionStartDate: timestamp("subscription_start_date", {
    withTimezone: true,
  }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 6. CLASSES TABLE
// ========================

export const classes = pgTable("classes", {
  id: uuid("id").defaultRandom().primaryKey(),
  enrollmentId: uuid("enrollment_id")
    .notNull()
    .references(() => enrollments.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").notNull().default(30),
  status: classStatusEnum("status").notNull().default("scheduled"),
  meetingLink: text("meeting_link"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 7. LESSONS TABLE
// ========================

export const lessons = pgTable("lessons", {
  id: uuid("id").defaultRandom().primaryKey(),
  enrollmentId: uuid("enrollment_id")
    .notNull()
    .references(() => enrollments.id, { onDelete: "cascade" }),
  lessonNumber: integer("lesson_number").notNull(),
  titleUr: varchar("title_ur", { length: 255 }),
  titleAr: varchar("title_ar", { length: 255 }),
  titleEn: varchar("title_en", { length: 255 }),
  content: jsonb("content"),
  lessonType: lessonTypeEnum("lesson_type").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  teacherNotes: text("teacher_notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 8. HIFZ_TRACKER TABLE
// ========================

export const hifzTracker = pgTable("hifz_tracker", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  surahNumber: smallint("surah_number").notNull(),
  ayahFrom: smallint("ayah_from").notNull(),
  ayahTo: smallint("ayah_to").notNull(),
  type: hifzTypeEnum("type").notNull(),
  status: hifzStatusEnum("status").notNull().default("pending"),
  lastRecitedAt: timestamp("last_recited_at", { withTimezone: true }),
  nextRevisionAt: timestamp("next_revision_at", { withTimezone: true }),
  score: smallint("score"),
  aiFeedback: text("ai_feedback"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 9. KIDS_ACTIVITIES TABLE
// ========================

export const kidsActivities = pgTable("kids_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activityType: activityTypeEnum("activity_type").notNull(),
  level: smallint("level").notNull().default(1),
  score: integer("score"),
  timeTakenSeconds: integer("time_taken_seconds"),
  mistakesCount: integer("mistakes_count"),
  haroofPracticed: text("haroof_practiced").array(),
  completedAt: timestamp("completed_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 10. AI_CHAT_HISTORY TABLE
// ========================

export const aiChatHistory = pgTable("ai_chat_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").notNull(),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  language: languageEnum("language").notNull().default("ur"),
  courseContext: varchar("course_context", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 11. WEEKLY_TESTS TABLE
// ========================

export const weeklyTests = pgTable("weekly_tests", {
  id: uuid("id").defaultRandom().primaryKey(),
  enrollmentId: uuid("enrollment_id")
    .notNull()
    .references(() => enrollments.id, { onDelete: "cascade" }),
  weekNumber: integer("week_number").notNull(),
  testDate: timestamp("test_date", { withTimezone: true }),
  totalQuestions: integer("total_questions"),
  correctAnswers: integer("correct_answers"),
  scorePercentage: numeric("score_percentage", { precision: 5, scale: 2 }),
  aiFeedback: text("ai_feedback"),
  teacherFeedback: text("teacher_feedback"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 12. CERTIFICATES TABLE
// ========================

export const certificates = pgTable("certificates", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  certificateType: certificateTypeEnum("certificate_type").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  certificateUrl: text("certificate_url"),
  verifiedBy: uuid("verified_by").references(() => users.id),
});

// ========================
// 13. SUBSCRIPTIONS TABLE
// ========================

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).unique(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  planType: planTypeEnum("plan_type").notNull(),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  amountUsd: numeric("amount_usd", { precision: 10, scale: 2 }),
  status: subscriptionStatusEnum("status").notNull().default("trialing"),
  currentPeriodStart: timestamp("current_period_start", {
    withTimezone: true,
  }),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 14. BLOG_POSTS TABLE
// ========================

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  titleUr: varchar("title_ur", { length: 500 }),
  titleAr: varchar("title_ar", { length: 500 }),
  titleEn: varchar("title_en", { length: 500 }),
  titleFr: varchar("title_fr", { length: 500 }),
  titleId: varchar("title_id", { length: 500 }),
  contentUr: text("content_ur"),
  contentAr: text("content_ar"),
  contentEn: text("content_en"),
  contentFr: text("content_fr"),
  contentId: text("content_id"),
  metaDescriptionEn: varchar("meta_description_en", { length: 300 }),
  metaDescriptionUr: varchar("meta_description_ur", { length: 300 }),
  keywords: text("keywords").array(),
  status: contentStatusEnum("status").notNull().default("pending_review"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNote: text("review_note"),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  aiGenerated: boolean("ai_generated").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 15. REVIEWS TABLE
// ========================

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  rating: smallint("rating").notNull(),
  reviewText: text("review_text"),
  isVideo: boolean("is_video").notNull().default(false),
  videoUrl: text("video_url"),
  isApproved: boolean("is_approved").notNull().default(false),
  aiModerated: boolean("ai_moderated").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  aiSpamScore: numeric("ai_spam_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 16. REFERRALS TABLE
// ========================

export const referrals = pgTable("referrals", {
  id: uuid("id").defaultRandom().primaryKey(),
  referrerId: uuid("referrer_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  referredId: uuid("referred_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  referralCode: varchar("referral_code", { length: 50 }).notNull().unique(),
  rewardMonths: integer("reward_months").notNull().default(1),
  isRewarded: boolean("is_rewarded").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 17. NOTIFICATIONS TABLE
// ========================

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull().default("system"),
  titleEn: varchar("title_en", { length: 255 }).notNull(),
  titleUr: varchar("title_ur", { length: 255 }),
  titleAr: varchar("title_ar", { length: 255 }),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  emailSent: boolean("email_sent").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 18. AI_USAGE_LOGS TABLE
// ========================

export const aiUsageLogs = pgTable("ai_usage_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").notNull(),
  tokensUsed: integer("tokens_used").notNull().default(0),
  estimatedCostCents: integer("estimated_cost_cents").notNull().default(0),
  model: varchar("model", { length: 100 }).notNull().default("claude-sonnet-4-5-20250929"),
  isFlagged: boolean("is_flagged").notNull().default(false),
  flagReason: text("flag_reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 19. ADMIN_SETTINGS TABLE
// ========================

export const adminSettings = pgTable("admin_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedBy: uuid("updated_by").references(() => users.id),
});

// ========================
// 20. TEACHER_PROFILES TABLE
// ========================

export const teacherProfiles = pgTable("teacher_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  bio: text("bio"),
  specializations: jsonb("specializations").$type<string[]>(),
  introVideoUrl: text("intro_video_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  yearsExperience: smallint("years_experience"),
  certifications: jsonb("certifications").$type<string[]>(),
  averageRating: numeric("average_rating", { precision: 3, scale: 2 }),
  totalStudents: integer("total_students").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 21. TEACHER_VIDEOS TABLE
// ========================

export const teacherVideos = pgTable("teacher_videos", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  // What is being recited — gives the page real indexable text and feeds VideoObject.
  surahName: varchar("surah_name", { length: 120 }),
  surahNumber: integer("surah_number"),
  ayahFrom: integer("ayah_from"),
  ayahTo: integer("ayah_to"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"),
  status: videoStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  isPublic: boolean("is_public").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 22. TEACHER_STUDENT_MATCHES TABLE
// ========================

export const teacherStudentMatches = pgTable("teacher_student_matches", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  status: matchStatusEnum("status").notNull().default("requested"),
  requestedAt: timestamp("requested_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  respondedAt: timestamp("responded_at", { withTimezone: true }),
  schedule: jsonb("schedule").$type<{
    days: string[];
    time: string;
    timezone: string;
  }>(),
  zoomLink: text("zoom_link"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 23. MESSAGES TABLE
// ========================

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: uuid("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  matchId: uuid("match_id")
    .notNull()
    .references(() => teacherStudentMatches.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  messageType: messageTypeEnum("message_type").notNull().default("text"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 24. CLASS_RECORDINGS TABLE
// ========================

export const classRecordings = pgTable("class_recordings", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id")
    .notNull()
    .references(() => teacherStudentMatches.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recordingUrl: text("recording_url").notNull(),
  duration: integer("duration"),
  sessionDate: timestamp("session_date", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isDeletedBySystem: boolean("is_deleted_by_system").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 25. DAILY_DARS TABLE
// ========================

export const dailyDars = pgTable("daily_dars", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  titleUr: varchar("title_ur", { length: 500 }),
  titleAr: varchar("title_ar", { length: 500 }),
  titleEn: varchar("title_en", { length: 500 }),
  titleFr: varchar("title_fr", { length: 500 }),
  titleId: varchar("title_id", { length: 500 }),
  contentUr: text("content_ur"),
  contentAr: text("content_ar"),
  contentEn: text("content_en"),
  contentFr: text("content_fr"),
  contentId: text("content_id"),
  category: darsCategoryEnum("category").notNull(),
  sourceReference: text("source_reference"),
  generatedBy: varchar("generated_by", { length: 100 }),
  status: contentStatusEnum("status").notNull().default("pending_review"),
  reviewedBy: uuid("reviewed_by").references(() => users.id, {
    onDelete: "set null",
  }),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewNote: text("review_note"),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  /** Poster generated at approval. NULL falls back to the on-demand route. */
  posterUrl: text("poster_url"),
  viewCount: integer("view_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 26. AGENT_LOGS TABLE
// ========================

export const agentLogs = pgTable("agent_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentName: varchar("agent_name", { length: 100 }).notNull(),
  taskType: varchar("task_type", { length: 255 }).notNull(),
  input: jsonb("input"),
  output: jsonb("output"),
  tokensUsed: integer("tokens_used"),
  durationMs: integer("duration_ms"),
  status: agentTaskStatusEnum("status").notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 27. TAJWEED_CHECKS TABLE
// ========================

export const tajweedChecks = pgTable("tajweed_checks", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  audioUrl: text("audio_url"),
  transcription: text("transcription"),
  surahNumber: smallint("surah_number").notNull(),
  ayahFrom: smallint("ayah_from").notNull(),
  ayahTo: smallint("ayah_to").notNull(),
  score: smallint("score"),
  feedback: jsonb("feedback").$type<{
    errors: Array<{
      type: string;
      word: string;
      expected: string;
      description: string;
    }>;
    strengths: string[];
    suggestions: string[];
  }>(),
  durationSeconds: integer("duration_seconds"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 28. STUDENT_POINTS TABLE
// ========================

export const studentPoints = pgTable("student_points", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: pointActionEnum("action").notNull(),
  points: integer("points").notNull(),
  referenceId: uuid("reference_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 29. STUDENT_STREAKS TABLE
// ========================

export const studentStreaks = pgTable("student_streaks", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActiveDate: timestamp("last_active_date", { withTimezone: true }),
  totalPoints: integer("total_points").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 30. STUDENT_BADGES TABLE
// ========================

export const studentBadges = pgTable("student_badges", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  badge: badgeTypeEnum("badge").notNull(),
  earnedAt: timestamp("earned_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 31. LEADERBOARD TABLE
// ========================

export const leaderboard = pgTable("leaderboard", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  totalPoints: integer("total_points").notNull().default(0),
  rank: integer("rank"),
  isOptedIn: boolean("is_opted_in").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 32. TEACHER_AI_CHATS TABLE
// ========================

export const teacherAiChats = pgTable("teacher_ai_chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionId: uuid("session_id").notNull(),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  taskContext: varchar("task_context", { length: 100 }),
  studentId: uuid("student_id").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 33. PARENT_REPORTS TABLE
// ========================

export const parentReports = pgTable("parent_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  parentWhatsapp: varchar("parent_whatsapp", { length: 20 }).notNull(),
  reportData: jsonb("report_data").$type<{
    weekStart: string;
    weekEnd: string;
    attendance: { present: number; total: number };
    lessonsCompleted: number;
    hifzProgress: { newAyaat: number; revised: number };
    testScores: number[];
    streak: number;
    summary: string;
  }>(),
  status: parentReportStatusEnum("status").notNull().default("pending"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 34. DARS_CIRCLES TABLE
// ========================

export const darsCircles = pgTable("dars_circles", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  titleUr: varchar("title_ur", { length: 500 }),
  titleAr: varchar("title_ar", { length: 500 }),
  titleEn: varchar("title_en", { length: 500 }),
  titleFr: varchar("title_fr", { length: 500 }),
  titleId: varchar("title_id", { length: 500 }),
  descriptionUr: text("description_ur"),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  descriptionFr: text("description_fr"),
  descriptionId: text("description_id"),
  category: darsCategoryEnum("category").notNull(),
  meetingLink: text("meeting_link"),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  maxStudents: integer("max_students").notNull().default(30),
  currentStudents: integer("current_students").notNull().default(0),
  status: circleStatusEnum("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 35. DARS_CIRCLE_ENROLLMENTS TABLE
// ========================

export const darsCircleEnrollments = pgTable("dars_circle_enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  circleId: uuid("circle_id")
    .notNull()
    .references(() => darsCircles.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 36. SCHEDULE_REQUESTS TABLE
// ========================

export const scheduleRequests = pgTable("schedule_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  courseId: uuid("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  timezone: varchar("timezone", { length: 100 }).notNull(),
  preferredDays: jsonb("preferred_days").$type<string[]>(),
  preferredTime: jsonb("preferred_time").$type<{
    start: string;
    end: string;
  }>(),
  aiSuggestions: jsonb("ai_suggestions").$type<
    Array<{
      day: string;
      time: string;
      score: number;
      reason: string;
    }>
  >(),
  selectedSlot: jsonb("selected_slot").$type<{
    day: string;
    time: string;
  }>(),
  status: scheduleRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 37. ZOOM_LINK on matches (added via zoomLink column)
// Note: zoomLink is added to teacherStudentMatches table above via alter —
// we use a separate table for admin recordings here
// ========================


export const changeRequestStatusEnum = pgEnum("change_request_status", [
  "pending",
  "approved",
  "rejected",
]);

// ========================
// 37. PROGRESS_ENTRIES TABLE (Teacher records student daily progress)
// ========================

export const progressEntries = pgTable("progress_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  matchId: uuid("match_id")
    .references(() => teacherStudentMatches.id, { onDelete: "set null" }),
  lessonCovered: varchar("lesson_covered", { length: 500 }).notNull(),
  rating: progressRatingEnum("rating").notNull(),
  notes: text("notes"),
  entryDate: timestamp("entry_date", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ========================
// 38. TESTS_ASSIGNMENTS TABLE (Teacher assigns tests/assignments per student)
// ========================

export const testsAssignments = pgTable("tests_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: assignmentTypeEnum("type").notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  frequency: assignmentFrequencyEnum("frequency").notNull().default("once"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  status: assignmentStatusEnum("status").notNull().default("pending"),
  /** When the student marked it done. NULL on rows completed before Phase 7. */
  completedAt: timestamp("completed_at", { withTimezone: true }),
  /**
   * Storage object path for the teacher's optional file, not a URL: the bucket
   * is private and the app signs a short-lived URL on read.
   */
  attachmentPath: text("attachment_path"),
  teacherGrade: varchar("teacher_grade", { length: 100 }),
  teacherFeedback: text("teacher_feedback"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ========================
// 39. STUDENT_COMPLAINTS TABLE
// ========================

export const studentComplaints = pgTable("student_complaints", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  subject: varchar("subject", { length: 500 }).notNull(),
  category: complaintCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  status: complaintStatusEnum("status").notNull().default("new"),
  adminNotes: text("admin_notes"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ========================
// 40. SCHEDULE_CHANGE_REQUESTS TABLE (Student requests schedule change)
// ========================

export const scheduleChangeRequests = pgTable("schedule_change_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  matchId: uuid("match_id")
    .notNull()
    .references(() => teacherStudentMatches.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  teacherId: uuid("teacher_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  newSchedule: jsonb("new_schedule").$type<{
    days: string[];
    time: string;
    timezone: string;
  }>().notNull(),
  reason: text("reason"),
  status: changeRequestStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ========================
// 41. ADMIN_CLASS_RECORDINGS TABLE (Admin uploads recordings per student)
// ========================

export const adminClassRecordings = pgTable("admin_class_recordings", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  uploadedBy: uuid("uploaded_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  recordingUrl: text("recording_url").notNull(),
  classDate: timestamp("class_date", { withTimezone: true }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ========================
// RELATIONS
// ========================

export const usersRelations = relations(users, ({ one, many }) => ({
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  teacherProfile: one(teacherProfiles, {
    fields: [users.id],
    references: [teacherProfiles.userId],
  }),
  enrollments: many(enrollments),
  hifzRecords: many(hifzTracker),
  kidsActivities: many(kidsActivities),
  chatHistory: many(aiChatHistory),
  certificates: many(certificates),
  subscriptions: many(subscriptions),
  reviews: many(reviews),
  referralsMade: many(referrals, { relationName: "referrer" }),
  referralsReceived: many(referrals, { relationName: "referred" }),
  classesAsTeacher: many(classes),
  notifications: many(notifications),
  aiUsageLogs: many(aiUsageLogs),
  teacherVideos: many(teacherVideos),
  matchesAsStudent: many(teacherStudentMatches, { relationName: "matchStudent" }),
  matchesAsTeacher: many(teacherStudentMatches, { relationName: "matchTeacher" }),
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  recordingsAsTeacher: many(classRecordings, { relationName: "recordingTeacher" }),
  recordingsAsStudent: many(classRecordings, { relationName: "recordingStudent" }),
  tajweedChecks: many(tajweedChecks),
  studentPoints: many(studentPoints),
  studentStreak: one(studentStreaks, {
    fields: [users.id],
    references: [studentStreaks.studentId],
  }),
  studentBadges: many(studentBadges),
  leaderboardEntry: one(leaderboard, {
    fields: [users.id],
    references: [leaderboard.studentId],
  }),
  teacherAiChatsAsTeacher: many(teacherAiChats, { relationName: "teacherAiChatTeacher" }),
  teacherAiChatsAsStudent: many(teacherAiChats, { relationName: "teacherAiChatStudent" }),
  parentReports: many(parentReports),
  darsCirclesAsTeacher: many(darsCircles),
  darsCircleEnrollments: many(darsCircleEnrollments),
  scheduleRequestsAsStudent: many(scheduleRequests, { relationName: "scheduleRequestStudent" }),
  scheduleRequestsAsTeacher: many(scheduleRequests, { relationName: "scheduleRequestTeacher" }),
}));

export const studentProfilesRelations = relations(
  studentProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [studentProfiles.userId],
      references: [users.id],
    }),
  })
);

export const coursesRelations = relations(courses, ({ many }) => ({
  aalimCategories: many(aalimCourseCategories),
  enrollments: many(enrollments),
  certificates: many(certificates),
  subscriptions: many(subscriptions),
  reviews: many(reviews),
  matches: many(teacherStudentMatches),
}));

export const aalimCourseCategoriesRelations = relations(
  aalimCourseCategories,
  ({ one }) => ({
    course: one(courses, {
      fields: [aalimCourseCategories.courseId],
      references: [courses.id],
    }),
  })
);

export const enrollmentsRelations = relations(
  enrollments,
  ({ one, many }) => ({
    student: one(users, {
      fields: [enrollments.studentId],
      references: [users.id],
    }),
    course: one(courses, {
      fields: [enrollments.courseId],
      references: [courses.id],
    }),
    classes: many(classes),
    lessons: many(lessons),
    weeklyTests: many(weeklyTests),
  })
);

export const classesRelations = relations(classes, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [classes.enrollmentId],
    references: [enrollments.id],
  }),
  teacher: one(users, {
    fields: [classes.teacherId],
    references: [users.id],
  }),
}));

export const lessonsRelations = relations(lessons, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [lessons.enrollmentId],
    references: [enrollments.id],
  }),
}));

export const hifzTrackerRelations = relations(hifzTracker, ({ one }) => ({
  student: one(users, {
    fields: [hifzTracker.studentId],
    references: [users.id],
  }),
}));

export const kidsActivitiesRelations = relations(
  kidsActivities,
  ({ one }) => ({
    student: one(users, {
      fields: [kidsActivities.studentId],
      references: [users.id],
    }),
  })
);

export const aiChatHistoryRelations = relations(aiChatHistory, ({ one }) => ({
  student: one(users, {
    fields: [aiChatHistory.studentId],
    references: [users.id],
  }),
}));

export const weeklyTestsRelations = relations(weeklyTests, ({ one }) => ({
  enrollment: one(enrollments, {
    fields: [weeklyTests.enrollmentId],
    references: [enrollments.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  student: one(users, {
    fields: [certificates.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
  verifier: one(users, {
    fields: [certificates.verifiedBy],
    references: [users.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  student: one(users, {
    fields: [subscriptions.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [subscriptions.courseId],
    references: [courses.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, () => ({}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  student: one(users, {
    fields: [reviews.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [reviews.courseId],
    references: [courses.id],
  }),
}));

export const referralsRelations = relations(referrals, ({ one }) => ({
  referrer: one(users, {
    fields: [referrals.referrerId],
    references: [users.id],
    relationName: "referrer",
  }),
  referred: one(users, {
    fields: [referrals.referredId],
    references: [users.id],
    relationName: "referred",
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const aiUsageLogsRelations = relations(aiUsageLogs, ({ one }) => ({
  student: one(users, {
    fields: [aiUsageLogs.studentId],
    references: [users.id],
  }),
}));

export const adminSettingsRelations = relations(adminSettings, ({ one }) => ({
  updater: one(users, {
    fields: [adminSettings.updatedBy],
    references: [users.id],
  }),
}));

// New table relations

export const teacherProfilesRelations = relations(
  teacherProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [teacherProfiles.userId],
      references: [users.id],
    }),
  })
);

export const teacherVideosRelations = relations(teacherVideos, ({ one }) => ({
  teacher: one(users, {
    fields: [teacherVideos.teacherId],
    references: [users.id],
  }),
}));

export const teacherStudentMatchesRelations = relations(
  teacherStudentMatches,
  ({ one, many }) => ({
    student: one(users, {
      fields: [teacherStudentMatches.studentId],
      references: [users.id],
      relationName: "matchStudent",
    }),
    teacher: one(users, {
      fields: [teacherStudentMatches.teacherId],
      references: [users.id],
      relationName: "matchTeacher",
    }),
    course: one(courses, {
      fields: [teacherStudentMatches.courseId],
      references: [courses.id],
    }),
    messages: many(messages),
    recordings: many(classRecordings),
  })
);

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
  match: one(teacherStudentMatches, {
    fields: [messages.matchId],
    references: [teacherStudentMatches.id],
  }),
}));

export const classRecordingsRelations = relations(
  classRecordings,
  ({ one }) => ({
    match: one(teacherStudentMatches, {
      fields: [classRecordings.matchId],
      references: [teacherStudentMatches.id],
    }),
    teacher: one(users, {
      fields: [classRecordings.teacherId],
      references: [users.id],
      relationName: "recordingTeacher",
    }),
    student: one(users, {
      fields: [classRecordings.studentId],
      references: [users.id],
      relationName: "recordingStudent",
    }),
  })
);

export const dailyDarsRelations = relations(dailyDars, () => ({}));

export const agentLogsRelations = relations(agentLogs, () => ({}));

export const tajweedChecksRelations = relations(tajweedChecks, ({ one }) => ({
  student: one(users, {
    fields: [tajweedChecks.studentId],
    references: [users.id],
  }),
}));

export const studentPointsRelations = relations(studentPoints, ({ one }) => ({
  student: one(users, {
    fields: [studentPoints.studentId],
    references: [users.id],
  }),
}));

export const studentStreaksRelations = relations(studentStreaks, ({ one }) => ({
  student: one(users, {
    fields: [studentStreaks.studentId],
    references: [users.id],
  }),
}));

export const studentBadgesRelations = relations(studentBadges, ({ one }) => ({
  student: one(users, {
    fields: [studentBadges.studentId],
    references: [users.id],
  }),
}));

export const leaderboardRelations = relations(leaderboard, ({ one }) => ({
  student: one(users, {
    fields: [leaderboard.studentId],
    references: [users.id],
  }),
}));

export const teacherAiChatsRelations = relations(
  teacherAiChats,
  ({ one }) => ({
    teacher: one(users, {
      fields: [teacherAiChats.teacherId],
      references: [users.id],
      relationName: "teacherAiChatTeacher",
    }),
    student: one(users, {
      fields: [teacherAiChats.studentId],
      references: [users.id],
      relationName: "teacherAiChatStudent",
    }),
  })
);

export const parentReportsRelations = relations(parentReports, ({ one }) => ({
  student: one(users, {
    fields: [parentReports.studentId],
    references: [users.id],
  }),
}));

export const darsCirclesRelations = relations(
  darsCircles,
  ({ one, many }) => ({
    teacher: one(users, {
      fields: [darsCircles.teacherId],
      references: [users.id],
    }),
    enrollments: many(darsCircleEnrollments),
  })
);

export const darsCircleEnrollmentsRelations = relations(
  darsCircleEnrollments,
  ({ one }) => ({
    circle: one(darsCircles, {
      fields: [darsCircleEnrollments.circleId],
      references: [darsCircles.id],
    }),
    student: one(users, {
      fields: [darsCircleEnrollments.studentId],
      references: [users.id],
    }),
  })
);

export const scheduleRequestsRelations = relations(
  scheduleRequests,
  ({ one }) => ({
    student: one(users, {
      fields: [scheduleRequests.studentId],
      references: [users.id],
      relationName: "scheduleRequestStudent",
    }),
    teacher: one(users, {
      fields: [scheduleRequests.teacherId],
      references: [users.id],
      relationName: "scheduleRequestTeacher",
    }),
    course: one(courses, {
      fields: [scheduleRequests.courseId],
      references: [courses.id],
    }),
  })
);

// ========================
// 39. POST_COUNTRY_LINKS TABLE
// ========================
// One row per country link placed inside a generated post. The next post links
// to whichever country page has gone longest without a row here, so all eight
// get coverage over time instead of every post linking to all eight.
export const postCountryLinks = pgTable("post_country_links", {
  id: uuid("id").defaultRandom().primaryKey(),
  country: varchar("country", { length: 60 }).notNull(),
  postType: varchar("post_type", { length: 20 }).notNull(), // "dars" | "blog"
  postSlug: varchar("post_slug", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ========================
// 38. ENROLLMENT_REQUESTS TABLE (homepage form submissions)
// ========================
export const enrollmentRequests = pgTable("enrollment_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 50 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  course: varchar("course", { length: 100 }).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(),
  message: text("message"),
  locale: varchar("locale", { length: 10 }).notNull().default("en"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
