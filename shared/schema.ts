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

export const documentTypeEnum = pgEnum("document_type", [
  "estimate",
  "contract",
  "terms"
]);

export const documentStatusEnum = pgEnum("document_status", [
  "draft",
  "pending_signature",
  "sent",
  "viewed",
  "signed",
  "declined",
  "voided",
  "expired"
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

// Newsletter Subscribers Table
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  source: varchar("source", { length: 50 }).default("website"),
  createdAt: timestamp("created_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
});

// Referrals Table
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerUserId: varchar("referrer_user_id").notNull(),
  referralCode: varchar("referral_code", { length: 20 }).notNull().unique(),
  referredUserId: varchar("referred_user_id"),
  referredEmail: varchar("referred_email", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  creditsEarned: integer("credits_earned").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  convertedAt: timestamp("converted_at"),
});

// User Credits Table (for referral rewards)
export const userCredits = pgTable("user_credits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: integer("amount").notNull().default(0),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description"),
  referralId: varchar("referral_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Add-On Categories Table (admin-configurable)
export const addOnCategories = pgTable("add_on_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add-On Items Table (individual add-ons within categories)
export const addOnItems = pgTable("add_on_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  tooltip: text("tooltip"),
  priceMin: integer("price_min").notNull(),
  priceMax: integer("price_max").notNull(),
  estimatedDays: integer("estimated_days"),
  timelineLabel: varchar("timeline_label", { length: 50 }),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  isPopular: boolean("is_popular").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Submission Add-Ons (junction table for selected add-ons per submission)
export const submissionAddOns = pgTable("submission_add_ons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull(),
  addOnItemId: varchar("add_on_item_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  customNotes: text("custom_notes"),
  estimatedPrice: integer("estimated_price"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Document Templates Table (admin-editable templates for legal documents)
export const documentTemplates = pgTable("document_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 150 }).notNull(),
  type: documentTypeEnum("type").notNull(),
  description: text("description"),
  bodyMarkdown: text("body_markdown").notNull(),
  variables: text("variables").array(),
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Documents Table (instances created from templates for submissions)
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  submissionId: varchar("submission_id").notNull(),
  templateId: varchar("template_id"),
  type: documentTypeEnum("type").notNull(),
  status: documentStatusEnum("status").notNull().default("draft"),
  title: varchar("title", { length: 200 }).notNull(),
  bodyHtml: text("body_html"),
  bodyMarkdown: text("body_markdown"),
  pdfStorageKey: varchar("pdf_storage_key"),
  pdfHash: varchar("pdf_hash"),
  signatureProviderId: varchar("signature_provider_id"),
  signatureProviderType: varchar("signature_provider_type", { length: 50 }),
  budgetBreakdown: text("budget_breakdown"),
  paymentTerms: text("payment_terms"),
  ownershipClause: text("ownership_clause"),
  supportTerms: text("support_terms"),
  customClauses: text("custom_clauses"),
  expiresAt: timestamp("expires_at"),
  sentAt: timestamp("sent_at"),
  viewedAt: timestamp("viewed_at"),
  signedAt: timestamp("signed_at"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Document Signers Table (who needs to sign each document)
export const documentSigners = pgTable("document_signers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  userId: varchar("user_id"),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 150 }),
  role: varchar("role", { length: 50 }).notNull().default("signer"),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  signatureProviderId: varchar("signature_provider_id"),
  signedAt: timestamp("signed_at"),
  declinedAt: timestamp("declined_at"),
  declineReason: text("decline_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Document Audit Logs Table (for compliance tracking)
export const documentAuditLogs = pgTable("document_audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  actorId: varchar("actor_id"),
  actorEmail: varchar("actor_email", { length: 255 }),
  action: varchar("action", { length: 50 }).notNull(),
  metadata: text("metadata"),
  ipAddress: varchar("ip_address", { length: 50 }),
  userAgent: text("user_agent"),
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

export const addOnCategoriesRelations = relations(addOnCategories, ({ many }) => ({
  items: many(addOnItems),
}));

export const addOnItemsRelations = relations(addOnItems, ({ one }) => ({
  category: one(addOnCategories, {
    fields: [addOnItems.categoryId],
    references: [addOnCategories.id],
  }),
}));

export const submissionAddOnsRelations = relations(submissionAddOns, ({ one }) => ({
  submission: one(submissions, {
    fields: [submissionAddOns.submissionId],
    references: [submissions.id],
  }),
  addOnItem: one(addOnItems, {
    fields: [submissionAddOns.addOnItemId],
    references: [addOnItems.id],
  }),
}));

export const documentTemplatesRelations = relations(documentTemplates, ({ many }) => ({
  documents: many(documents),
}));

export const documentsRelations = relations(documents, ({ one, many }) => ({
  submission: one(submissions, {
    fields: [documents.submissionId],
    references: [submissions.id],
  }),
  template: one(documentTemplates, {
    fields: [documents.templateId],
    references: [documentTemplates.id],
  }),
  signers: many(documentSigners),
  auditLogs: many(documentAuditLogs),
}));

export const documentSignersRelations = relations(documentSigners, ({ one }) => ({
  document: one(documents, {
    fields: [documentSigners.documentId],
    references: [documents.id],
  }),
}));

export const documentAuditLogsRelations = relations(documentAuditLogs, ({ one }) => ({
  document: one(documents, {
    fields: [documentAuditLogs.documentId],
    references: [documents.id],
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

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  createdAt: true,
  unsubscribedAt: true,
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  convertedAt: true,
});

export const insertUserCreditsSchema = createInsertSchema(userCredits).omit({
  id: true,
  createdAt: true,
});

export const insertAddOnCategorySchema = createInsertSchema(addOnCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAddOnItemSchema = createInsertSchema(addOnItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubmissionAddOnSchema = createInsertSchema(submissionAddOns).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentTemplateSchema = createInsertSchema(documentTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSignerSchema = createInsertSchema(documentSigners).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentAuditLogSchema = createInsertSchema(documentAuditLogs).omit({
  id: true,
  createdAt: true,
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
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type UserCredits = typeof userCredits.$inferSelect;
export type InsertUserCredits = z.infer<typeof insertUserCreditsSchema>;
export type AddOnCategory = typeof addOnCategories.$inferSelect;
export type InsertAddOnCategory = z.infer<typeof insertAddOnCategorySchema>;
export type AddOnItem = typeof addOnItems.$inferSelect;
export type InsertAddOnItem = z.infer<typeof insertAddOnItemSchema>;
export type SubmissionAddOn = typeof submissionAddOns.$inferSelect;
export type InsertSubmissionAddOn = z.infer<typeof insertSubmissionAddOnSchema>;
export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type InsertDocumentTemplate = z.infer<typeof insertDocumentTemplateSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocumentSigner = typeof documentSigners.$inferSelect;
export type InsertDocumentSigner = z.infer<typeof insertDocumentSignerSchema>;
export type DocumentAuditLog = typeof documentAuditLogs.$inferSelect;
export type InsertDocumentAuditLog = z.infer<typeof insertDocumentAuditLogSchema>;
