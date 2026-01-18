import { 
  submissions, type Submission, type InsertSubmission,
  payments, type Payment, type InsertPayment,
  reviews, type Review, type InsertReview,
  messages, type Message, type InsertMessage,
  newsletterSubscribers, type NewsletterSubscriber, type InsertNewsletterSubscriber,
  referrals, type Referral, type InsertReferral,
  userCredits, type UserCredits, type InsertUserCredits
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, isNull, sql } from "drizzle-orm";

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
  getPaymentByStripeId(stripePaymentId: string): Promise<Payment | undefined>;
  
  // Reviews
  createReview(review: InsertReview): Promise<Review>;
  getReviewsBySubmission(submissionId: string): Promise<Review[]>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySubmission(submissionId: string): Promise<Message[]>;
  markMessagesAsRead(submissionId: string, userId: string): Promise<void>;
  
  // Newsletter
  createNewsletterSubscriber(data: InsertNewsletterSubscriber): Promise<NewsletterSubscriber>;
  getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined>;
  unsubscribeNewsletter(email: string): Promise<void>;
  reactivateNewsletterSubscriber(email: string): Promise<void>;
  
  // Referrals
  createReferral(data: InsertReferral): Promise<Referral>;
  getReferralByCode(code: string): Promise<Referral | undefined>;
  getReferralsByUser(userId: string): Promise<Referral[]>;
  updateReferral(id: string, data: Partial<Referral>): Promise<Referral | undefined>;
  generateUniqueReferralCode(): Promise<string>;
  
  // User Credits
  createUserCredits(data: InsertUserCredits): Promise<UserCredits>;
  getUserCredits(userId: string): Promise<UserCredits[]>;
  getUserTotalCredits(userId: string): Promise<number>;
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

  // Newsletter
  async createNewsletterSubscriber(data: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [result] = await db.insert(newsletterSubscribers).values(data).returning();
    return result;
  }

  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    const [result] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email));
    return result;
  }

  async unsubscribeNewsletter(email: string): Promise<void> {
    await db.update(newsletterSubscribers)
      .set({ isActive: false, unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.email, email));
  }

  async reactivateNewsletterSubscriber(email: string): Promise<void> {
    await db.update(newsletterSubscribers)
      .set({ isActive: true, unsubscribedAt: null })
      .where(eq(newsletterSubscribers.email, email));
  }

  // Payment lookup by Stripe ID
  async getPaymentByStripeId(stripePaymentId: string): Promise<Payment | undefined> {
    const [result] = await db.select().from(payments).where(eq(payments.stripePaymentId, stripePaymentId));
    return result;
  }

  // Referrals
  async createReferral(data: InsertReferral): Promise<Referral> {
    const [result] = await db.insert(referrals).values(data).returning();
    return result;
  }

  async getReferralByCode(code: string): Promise<Referral | undefined> {
    const [result] = await db.select().from(referrals).where(eq(referrals.referralCode, code));
    return result;
  }

  async getReferralsByUser(userId: string): Promise<Referral[]> {
    return db.select().from(referrals).where(eq(referrals.referrerUserId, userId));
  }

  async updateReferral(id: string, data: Partial<Referral>): Promise<Referral | undefined> {
    const [result] = await db.update(referrals).set(data).where(eq(referrals.id, id)).returning();
    return result;
  }

  async generateUniqueReferralCode(): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code: string;
    let exists = true;
    
    while (exists) {
      code = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const existing = await this.getReferralByCode(code);
      exists = !!existing;
    }
    
    return code!;
  }

  // User Credits
  async createUserCredits(data: InsertUserCredits): Promise<UserCredits> {
    const [result] = await db.insert(userCredits).values(data).returning();
    return result;
  }

  async getUserCredits(userId: string): Promise<UserCredits[]> {
    return db.select().from(userCredits).where(eq(userCredits.userId, userId));
  }

  async getUserTotalCredits(userId: string): Promise<number> {
    const result = await db.select({ total: sql<number>`COALESCE(SUM(${userCredits.amount}), 0)` })
      .from(userCredits)
      .where(eq(userCredits.userId, userId));
    return result[0]?.total || 0;
  }
}

export const storage = new DatabaseStorage();
