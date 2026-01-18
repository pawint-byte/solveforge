import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { insertSubmissionSchema, insertMessageSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import { stripeService } from "./stripeService";
import { getStripePublishableKey, getUncachableStripeClient } from "./stripeClient";
import { addSubscriberToMailchimp, removeSubscriberFromMailchimp } from "./mailchimp";

// Admin user IDs - add your user ID here after first login
const ADMIN_USER_IDS = new Set<string>([
  // Add admin user IDs here
]);

// Middleware to check if user is admin
function isAdmin(req: Request, res: Response, next: Function) {
  const userId = (req.user as any)?.claims?.sub;
  if (!userId || !ADMIN_USER_IDS.has(userId)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // ============ SUBMISSION ROUTES ============

  // Create a new submission
  app.post("/api/submissions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const data = insertSubmissionSchema.parse({
        ...req.body,
        userId,
      });
      
      const submission = await storage.createSubmission(data);
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid submission data", errors: error.errors });
      } else {
        console.error("Error creating submission:", error);
        res.status(500).json({ message: "Failed to create submission" });
      }
    }
  });

  // Get current user's submissions
  app.get("/api/submissions/my", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissions = await storage.getSubmissionsByUser(userId);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Get a single submission (user can only see their own, admin can see all)
  app.get("/api/submissions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submission = await storage.getSubmission(req.params.id);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      // Check if user owns this submission or is admin
      if (submission.userId !== userId && !ADMIN_USER_IDS.has(userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "Failed to fetch submission" });
    }
  });

  // ============ ADMIN ROUTES ============

  // Get all submissions (admin only)
  app.get("/api/admin/submissions", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const submissions = await storage.getAllSubmissions();
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching all submissions:", error);
      res.status(500).json({ message: "Failed to fetch submissions" });
    }
  });

  // Update submission status (admin only)
  const validStatuses = ["pending", "in_review", "approved", "in_progress", "solution_proposed", "completed", "cancelled"];
  
  app.patch("/api/admin/submissions/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { status, adminNotes } = req.body;
      
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const submission = await storage.updateSubmission(req.params.id, { 
        status, 
        adminNotes 
      });
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      res.json(submission);
    } catch (error) {
      console.error("Error updating submission:", error);
      res.status(500).json({ message: "Failed to update submission" });
    }
  });

  // Check if current user is admin
  app.get("/api/admin/check", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    res.json({ isAdmin: ADMIN_USER_IDS.has(userId) });
  });

  // ============ MESSAGES ROUTES ============

  // Get messages for a submission
  app.get("/api/submissions/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submission = await storage.getSubmission(req.params.id);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      if (submission.userId !== userId && !ADMIN_USER_IDS.has(userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const messages = await storage.getMessagesBySubmission(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message
  app.post("/api/submissions/:id/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissionId = req.params.id;
      const submission = await storage.getSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      const isAdminUser = ADMIN_USER_IDS.has(userId);
      
      if (submission.userId !== userId && !isAdminUser) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const data = insertMessageSchema.parse({
        submissionId,
        senderId: userId,
        content: req.body.content,
        isFromAdmin: isAdminUser,
      });
      
      const message = await storage.createMessage(data);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });

  // ============ REVIEWS ROUTES ============

  // Create a review for a completed submission
  app.post("/api/submissions/:id/reviews", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submissionId = req.params.id;
      const submission = await storage.getSubmission(submissionId);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      if (submission.userId !== userId) {
        return res.status(403).json({ message: "Only the submitter can leave a review" });
      }
      
      if (submission.status !== "completed") {
        return res.status(400).json({ message: "Can only review completed submissions" });
      }
      
      const data = insertReviewSchema.parse({
        submissionId,
        userId,
        rating: req.body.rating,
        comment: req.body.comment,
      });
      
      const review = await storage.createReview(data);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid review data", errors: error.errors });
      } else {
        console.error("Error creating review:", error);
        res.status(500).json({ message: "Failed to create review" });
      }
    }
  });

  // ============ STRIPE PAYMENT ROUTES ============

  // Get Stripe publishable key for frontend
  app.get("/api/stripe/config", async (req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Error getting Stripe config:", error);
      res.status(500).json({ message: "Failed to get Stripe configuration" });
    }
  });

  // Create a checkout session for a submission deposit (30% upfront)
  app.post("/api/submissions/:id/checkout", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submission = await storage.getSubmission(req.params.id);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      if (submission.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check if already has a deposit payment
      const existingPayments = await storage.getPaymentsBySubmission(req.params.id);
      const hasDeposit = existingPayments.some(p => p.milestoneNumber === 1 && p.status === "completed");
      if (hasDeposit) {
        return res.status(400).json({ message: "Deposit already paid" });
      }

      const stripe = await getUncachableStripeClient();
      
      // Calculate 30% deposit based on budget range midpoint
      const budgetMidpoint = (submission.budgetMin + submission.budgetMax) / 2;
      const depositAmount = Math.round(budgetMidpoint * 0.3 * 100); // Convert to cents
      const depositAmountDecimal = (depositAmount / 100).toFixed(2);

      // Create payment record first (pending status)
      const payment = await storage.createPayment({
        submissionId: submission.id,
        userId,
        amount: depositAmountDecimal,
        currency: submission.currency,
        status: "pending",
        milestoneNumber: 1,
        description: "30% upfront deposit",
      });

      // Create a checkout session with payment ID in metadata
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: submission.currency.toLowerCase(),
            product_data: {
              name: `SolveForge Deposit - ${submission.title}`,
              description: "30% upfront deposit for problem-solving service",
            },
            unit_amount: depositAmount,
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/submissions/${submission.id}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.protocol}://${req.get("host")}/submissions/${submission.id}?payment=cancelled`,
        metadata: {
          submissionId: submission.id,
          userId,
          milestoneNumber: "1",
          type: "deposit",
          paymentId: payment.id,
        },
      });

      // Update payment with Stripe session ID
      await storage.updatePayment(payment.id, { stripePaymentId: session.id });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ message: "Failed to create checkout session" });
    }
  });

  // Get payments for a submission
  app.get("/api/submissions/:id/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submission = await storage.getSubmission(req.params.id);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      if (submission.userId !== userId && !ADMIN_USER_IDS.has(userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const payments = await storage.getPaymentsBySubmission(req.params.id);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Admin: Create milestone payment request
  app.post("/api/admin/submissions/:id/milestone", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { milestoneNumber, amount, description } = req.body;
      const submission = await storage.getSubmission(req.params.id);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }

      const payment = await storage.createPayment({
        submissionId: submission.id,
        userId: submission.userId,
        amount: String(amount),
        currency: submission.currency,
        status: "pending",
        milestoneNumber,
        description,
      });

      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating milestone payment:", error);
      res.status(500).json({ message: "Failed to create milestone payment" });
    }
  });

  // ============ NEWSLETTER ROUTES ============

  // Subscribe to newsletter
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || !email.includes("@")) {
        return res.status(400).json({ message: "Valid email required" });
      }

      const existing = await storage.getNewsletterSubscriberByEmail(email);
      if (existing) {
        if (existing.isActive) {
          return res.status(400).json({ message: "Already subscribed" });
        }
        // Re-activate subscription by updating existing record
        await storage.reactivateNewsletterSubscriber(email);
        // Sync with Mailchimp
        addSubscriberToMailchimp(email, "reactivation").catch(console.error);
        return res.json({ message: "Subscription reactivated" });
      }

      await storage.createNewsletterSubscriber({ email, source: "website" });
      // Sync with Mailchimp
      addSubscriberToMailchimp(email, "website").catch(console.error);
      res.status(201).json({ message: "Subscribed successfully" });
    } catch (error: any) {
      if (error.code === "23505") {
        return res.status(400).json({ message: "Already subscribed" });
      }
      console.error("Error subscribing to newsletter:", error);
      res.status(500).json({ message: "Failed to subscribe" });
    }
  });

  // Unsubscribe from newsletter
  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      await storage.unsubscribeNewsletter(email);
      // Sync with Mailchimp
      removeSubscriberFromMailchimp(email).catch(console.error);
      res.json({ message: "Unsubscribed successfully" });
    } catch (error) {
      console.error("Error unsubscribing:", error);
      res.status(500).json({ message: "Failed to unsubscribe" });
    }
  });

  // ============ REFERRAL ROUTES ============

  // Get or create referral code for current user
  app.get("/api/referral/code", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getReferralsByUser(userId);
      
      let referral = referrals.find(r => !r.referredUserId);
      
      if (!referral) {
        const code = await storage.generateUniqueReferralCode();
        referral = await storage.createReferral({
          referrerUserId: userId,
          referralCode: code,
          status: "pending",
        });
      }

      res.json({ 
        code: referral.referralCode,
        referralUrl: `${req.protocol}://${req.get("host")}/?ref=${referral.referralCode}`
      });
    } catch (error) {
      console.error("Error getting referral code:", error);
      res.status(500).json({ message: "Failed to get referral code" });
    }
  });

  // Get referral stats for current user
  app.get("/api/referral/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const referrals = await storage.getReferralsByUser(userId);
      const totalCredits = await storage.getUserTotalCredits(userId);
      
      const converted = referrals.filter(r => r.status === "converted").length;
      const pending = referrals.filter(r => r.status === "pending" && r.referredEmail).length;

      res.json({
        totalReferrals: converted,
        pendingReferrals: pending,
        totalCredits,
      });
    } catch (error) {
      console.error("Error getting referral stats:", error);
      res.status(500).json({ message: "Failed to get referral stats" });
    }
  });

  // Track referral click (for analytics)
  app.post("/api/referral/track", async (req, res) => {
    try {
      const { code } = req.body;
      const referral = await storage.getReferralByCode(code);
      
      if (!referral) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      res.json({ valid: true, code });
    } catch (error) {
      console.error("Error tracking referral:", error);
      res.status(500).json({ message: "Failed to track referral" });
    }
  });

  // Apply referral after signup (called when new user signs up with ref code)
  app.post("/api/referral/apply", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code } = req.body;
      
      const referral = await storage.getReferralByCode(code);
      
      if (!referral) {
        return res.status(404).json({ message: "Invalid referral code" });
      }

      if (referral.referrerUserId === userId) {
        return res.status(400).json({ message: "Cannot use your own referral code" });
      }

      if (referral.referredUserId) {
        return res.status(400).json({ message: "Referral code already used" });
      }

      // Update referral as converted
      await storage.updateReferral(referral.id, {
        referredUserId: userId,
        status: "converted",
        convertedAt: new Date(),
        creditsEarned: 100,
      });

      // Award credits to referrer
      await storage.createUserCredits({
        userId: referral.referrerUserId,
        amount: 100,
        type: "referral_bonus",
        description: "Referral bonus for new user signup",
        referralId: referral.id,
      });

      // Award credits to referred user (welcome bonus)
      await storage.createUserCredits({
        userId,
        amount: 50,
        type: "welcome_bonus",
        description: "Welcome bonus for signing up with referral",
        referralId: referral.id,
      });

      res.json({ message: "Referral applied successfully", creditsEarned: 50 });
    } catch (error) {
      console.error("Error applying referral:", error);
      res.status(500).json({ message: "Failed to apply referral" });
    }
  });

  // Get user's credit balance
  app.get("/api/credits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const totalCredits = await storage.getUserTotalCredits(userId);
      const creditHistory = await storage.getUserCredits(userId);
      
      res.json({ totalCredits, history: creditHistory });
    } catch (error) {
      console.error("Error getting credits:", error);
      res.status(500).json({ message: "Failed to get credits" });
    }
  });

  // ============ AFFILIATE MARKETING ROUTES ============

  // Track affiliate conversion (placeholder for ShareASale integration)
  app.post("/api/affiliate/conversion", async (req, res) => {
    try {
      const { merchant_id, amount, order_id, currency, affiliate_id, sub_id } = req.body;
      
      // Log conversion for future processing
      console.log("Affiliate conversion:", { merchant_id, amount, order_id, currency, affiliate_id, sub_id });
      
      // TODO: When ShareASale is configured:
      // 1. Validate the conversion
      // 2. Store in database for reporting
      // 3. Trigger ShareASale API if needed
      
      res.json({ success: true, message: "Conversion tracked" });
    } catch (error) {
      console.error("Error tracking affiliate conversion:", error);
      res.status(500).json({ message: "Failed to track conversion" });
    }
  });

  return httpServer;
}
