import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Enums
export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "in_review", 
  "approved",
  "in_progress",
  "solution_proposed",
  "completed",
  "cancelled"
]);

export const timelineEnum = pgEnum("timeline", [
  "asap",
  "one_to_four_weeks",
  "one_to_three_months",
  "flexible"
]);

export const categoryEnum = pgEnum("category", [
  "tech",
  "business",
  "design",
  "personal",
  "other"
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "partial",
  "completed",
  "refunded"
]);

// Problem Submissions Table
export const submissions = pgTable("submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: categoryEnum("category").notNull().default("other"),
  tags: text("tags").array(),
  timeline: timelineEnum("timeline").notNull().default("flexible"),
  budgetMin: integer("budget_min").notNull().default(100),
  budgetMax: integer("budget_max").notNull().default(500),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: submissionStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  attachments: text("attachments").array(),
  linkedinUrl: varchar("linkedin_url"),
  phoneNumber: varchar("phone_number"),
  consentGiven: boolean("consent_given").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments Table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull(),
  userId: varchar("user_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  stripePaymentId: varchar("stripe_payment_id"),
  stripeInvoiceId: varchar("stripe_invoice_id"),
  milestoneNumber: integer("milestone_number").default(1),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  paidAt: timestamp("paid_at"),
});

// Reviews/Ratings Table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages Table (for admin-user communication)
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  content: text("content").notNull(),
  isFromAdmin: boolean("is_from_admin").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const submissionsRelations = relations(submissions, ({ many }) => ({
  payments: many(payments),
  reviews: many(reviews),
  messages: many(messages),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  submission: one(submissions, {
    fields: [payments.submissionId],
    references: [submissions.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  submission: one(submissions, {
    fields: [reviews.submissionId],
    references: [submissions.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  submission: one(submissions, {
    fields: [messages.submissionId],
    references: [submissions.id],
  }),
}));

// Zod Schemas for validation
export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  adminNotes: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  paidAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  readAt: true,
});

// Types
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
