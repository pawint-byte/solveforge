import { 
  submissions, type Submission, type InsertSubmission,
  payments, type Payment, type InsertPayment,
  reviews, type Review, type InsertReview,
  messages, type Message, type InsertMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, isNull } from "drizzle-orm";

export interface IStorage {
  // Submissions
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | undefined>;
  getSubmissionsByUser(userId: string): Promise<Submission[]>;
  getAllSubmissions(): Promise<Submission[]>;
  updateSubmission(id: string, data: Partial<Submission>): Promise<Submission | undefined>;
  
  // Payments
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsBySubmission(submissionId: string): Promise<Payment[]>;
  updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsBySubmission(submissionId: string): Promise<Review[]>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySubmission(submissionId: string): Promise<Message[]>;
  markMessagesAsRead(submissionId: string, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Submissions
  async createSubmission(submission: InsertSubmission): Promise<Submission> {
    const [result] = await db.insert(submissions).values(submission).returning();
    return result;
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [result] = await db.select().from(submissions).where(eq(submissions.id, id));
    return result;
  }

  async getSubmissionsByUser(userId: string): Promise<Submission[]> {
    return db.select().from(submissions).where(eq(submissions.userId, userId)).orderBy(desc(submissions.createdAt));
  }

  async getAllSubmissions(): Promise<Submission[]> {
    return db.select().from(submissions).orderBy(desc(submissions.createdAt));
  }

  async updateSubmission(id: string, data: Partial<Submission>): Promise<Submission | undefined> {
    const [result] = await db
      .update(submissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(submissions.id, id))
      .returning();
    return result;
  }

  // Payments
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [result] = await db.insert(payments).values(payment).returning();
    return result;
  }

  async getPaymentsBySubmission(submissionId: string): Promise<Payment[]> {
    return db.select().from(payments).where(eq(payments.submissionId, submissionId));
  }

  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment | undefined> {
    const [result] = await db
      .update(payments)
      .set(data)
      .where(eq(payments.id, id))
      .returning();
    return result;
  }

  // Reviews
  async createReview(review: InsertReview): Promise<Review> {
    const [result] = await db.insert(reviews).values(review).returning();
    return result;
  }

  async getReviewsBySubmission(submissionId: string): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.submissionId, submissionId));
  }

  // Messages
  async createMessage(message: InsertMessage): Promise<Message> {
    const [result] = await db.insert(messages).values(message).returning();
    return result;
  }

  async getMessagesBySubmission(submissionId: string): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.submissionId, submissionId)).orderBy(desc(messages.createdAt));
  }

  async markMessagesAsRead(submissionId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.submissionId, submissionId),
          isNull(messages.readAt)
        )
      );
  }
}

export const storage = new DatabaseStorage();
