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
  "52852375",  // Andrew A Wint
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
      const { addOns, ...submissionData } = req.body;
      
      const data = insertSubmissionSchema.parse({
        ...submissionData,
        userId,
      });
      
      const submission = await storage.createSubmission(data);
      
      // Save selected add-ons if provided - validate and use server-side pricing
      if (addOns && Array.isArray(addOns)) {
        for (const addon of addOns) {
          if (!addon.itemId) continue;
          
          // Validate item exists and get server-side pricing
          const addOnItem = await storage.getAddOnItem(addon.itemId);
          if (!addOnItem || !addOnItem.isActive) {
            console.warn(`Invalid or inactive add-on item: ${addon.itemId}`);
            continue;
          }
          
          await storage.createSubmissionAddOn({
            submissionId: submission.id,
            addOnItemId: addon.itemId,
            priceQuoted: addOnItem.priceMin, // Use server-side minimum price
            customDescription: addon.customDescription,
          });
        }
      }
      
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

  // Create a crypto checkout for a submission deposit using Coinbase Commerce
  app.post("/api/submissions/:id/crypto-checkout", isAuthenticated, async (req: any, res) => {
    try {
      const { createCryptoCharge, isCoinbaseCommerceConfigured } = await import("./coinbaseCommerce");
      
      if (!isCoinbaseCommerceConfigured()) {
        return res.status(503).json({ message: "Crypto payments not configured" });
      }

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

      // Calculate 30% deposit based on budget range midpoint
      const budgetMidpoint = (submission.budgetMin + submission.budgetMax) / 2;
      const depositAmount = (budgetMidpoint * 0.3).toFixed(2);

      // Create payment record first (pending status)
      const payment = await storage.createPayment({
        submissionId: submission.id,
        userId,
        amount: depositAmount,
        currency: submission.currency,
        status: "pending",
        milestoneNumber: 1,
        description: "30% upfront deposit (Crypto)",
      });

      // Create a Coinbase Commerce charge
      const charge = await createCryptoCharge({
        name: `SolveForge Deposit - ${submission.title}`,
        description: "30% upfront deposit for problem-solving service",
        amount: depositAmount,
        currency: submission.currency,
        metadata: {
          submissionId: submission.id,
          userId,
          milestoneNumber: "1",
          type: "deposit",
          paymentId: payment.id,
        },
        redirectUrl: `${req.protocol}://${req.get("host")}/submissions/${submission.id}?payment=success&crypto=true`,
        cancelUrl: `${req.protocol}://${req.get("host")}/submissions/${submission.id}?payment=cancelled`,
      });

      // Update payment with crypto charge ID
      await storage.updatePayment(payment.id, { stripePaymentId: `crypto_${charge.id}` });

      res.json({ url: charge.hostedUrl, chargeId: charge.id });
    } catch (error) {
      console.error("Error creating crypto checkout:", error);
      res.status(500).json({ message: "Failed to create crypto checkout" });
    }
  });

  // Check if crypto payments are available
  app.get("/api/crypto/available", async (req, res) => {
    try {
      const { isCoinbaseCommerceConfigured } = await import("./coinbaseCommerce");
      res.json({ available: isCoinbaseCommerceConfigured() });
    } catch (error) {
      res.json({ available: false });
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

  // ============ ADD-ON ROUTES ============

  // Get all add-on categories with items (public)
  app.get("/api/addons", async (req, res) => {
    try {
      const categories = await storage.getActiveAddOnCategories();
      const items = await storage.getActiveAddOnItems();
      
      // Group items by category
      const categoriesWithItems = categories.map(category => ({
        ...category,
        items: items.filter(item => item.categoryId === category.id)
      }));
      
      res.json(categoriesWithItems);
    } catch (error) {
      console.error("Error fetching add-ons:", error);
      res.status(500).json({ message: "Failed to fetch add-ons" });
    }
  });

  // Admin: Get all add-on categories (including inactive)
  app.get("/api/admin/addons/categories", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const categories = await storage.getAllAddOnCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Admin: Create add-on category
  app.post("/api/admin/addons/categories", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const category = await storage.createAddOnCategory(req.body);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Admin: Update add-on category
  app.patch("/api/admin/addons/categories/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const category = await storage.updateAddOnCategory(req.params.id, req.body);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Admin: Delete add-on category
  app.delete("/api/admin/addons/categories/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteAddOnCategory(req.params.id);
      res.json({ message: "Category deleted" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Admin: Get all add-on items
  app.get("/api/admin/addons/items", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const items = await storage.getAllAddOnItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  // Admin: Create add-on item
  app.post("/api/admin/addons/items", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const item = await storage.createAddOnItem(req.body);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  // Admin: Update add-on item
  app.patch("/api/admin/addons/items/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const item = await storage.updateAddOnItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  // Admin: Delete add-on item
  app.delete("/api/admin/addons/items/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteAddOnItem(req.params.id);
      res.json({ message: "Item deleted" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Get add-ons for a submission (with item details)
  app.get("/api/submissions/:id/addons", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submission = await storage.getSubmission(req.params.id);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      if (submission.userId !== userId && !ADMIN_USER_IDS.has(userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const addons = await storage.getSubmissionAddOnsWithDetails(req.params.id);
      res.json(addons);
    } catch (error) {
      console.error("Error fetching submission add-ons:", error);
      res.status(500).json({ message: "Failed to fetch add-ons" });
    }
  });

  // Admin: Seed default add-ons
  app.post("/api/admin/addons/seed", isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Create default categories
      const categories = [
        { name: "Authentication & Security", description: "User authentication and security features", icon: "Shield", sortOrder: 1 },
        { name: "Payments & E-commerce", description: "Payment processing and online store features", icon: "CreditCard", sortOrder: 2 },
        { name: "Analytics & SEO", description: "Analytics tracking and search engine optimization", icon: "BarChart", sortOrder: 3 },
        { name: "UI/UX Enhancements", description: "User interface and experience improvements", icon: "Palette", sortOrder: 4 },
        { name: "Integrations", description: "Third-party service integrations", icon: "Plug", sortOrder: 5 },
        { name: "Custom", description: "Custom features and requirements", icon: "Settings", sortOrder: 6 },
      ];

      const createdCategories: any[] = [];
      for (const cat of categories) {
        const created = await storage.createAddOnCategory(cat);
        createdCategories.push(created);
      }

      // Default add-on items
      const items = [
        // Authentication & Security
        { categoryId: createdCategories[0].id, name: "Social Login (Google)", description: "Add Google OAuth login", tooltip: "Allow users to sign in with their Google account", priceMin: 200, priceMax: 300, estimatedDays: 3, timelineLabel: "3-5 days", sortOrder: 1, isPopular: true },
        { categoryId: createdCategories[0].id, name: "Social Login (Facebook)", description: "Add Facebook OAuth login", tooltip: "Allow users to sign in with their Facebook account", priceMin: 200, priceMax: 300, estimatedDays: 3, timelineLabel: "3-5 days", sortOrder: 2 },
        { categoryId: createdCategories[0].id, name: "Two-Factor Authentication (2FA)", description: "Add 2FA for enhanced security", tooltip: "Protect accounts with SMS or app-based verification", priceMin: 300, priceMax: 500, estimatedDays: 5, timelineLabel: "1 week", sortOrder: 3, isPopular: true },
        { categoryId: createdCategories[0].id, name: "CAPTCHA Integration", description: "Add CAPTCHA to forms", tooltip: "Prevent bots with Google reCAPTCHA", priceMin: 100, priceMax: 200, estimatedDays: 2, timelineLabel: "2-3 days", sortOrder: 4 },
        // Payments & E-commerce
        { categoryId: createdCategories[1].id, name: "Stripe Integration", description: "Accept card payments with Stripe", tooltip: "Full Stripe checkout integration", priceMin: 400, priceMax: 700, estimatedDays: 7, timelineLabel: "1-2 weeks", sortOrder: 1, isPopular: true },
        { categoryId: createdCategories[1].id, name: "Shopping Cart", description: "Multi-item shopping cart", tooltip: "Add to cart, quantity updates, cart persistence", priceMin: 500, priceMax: 900, estimatedDays: 10, timelineLabel: "1-2 weeks", sortOrder: 2 },
        { categoryId: createdCategories[1].id, name: "Subscription Billing", description: "Recurring payment system", tooltip: "Monthly/yearly subscription plans", priceMin: 600, priceMax: 1000, estimatedDays: 14, timelineLabel: "2-3 weeks", sortOrder: 3, isPopular: true },
        { categoryId: createdCategories[1].id, name: "Cryptocurrency Payments", description: "Accept BTC, ETH, and more", tooltip: "Coinbase Commerce integration", priceMin: 300, priceMax: 500, estimatedDays: 5, timelineLabel: "1 week", sortOrder: 4 },
        // Analytics & SEO
        { categoryId: createdCategories[2].id, name: "Google Analytics 4 Setup", description: "Full GA4 implementation", tooltip: "Event tracking, conversions, custom reports", priceMin: 150, priceMax: 300, estimatedDays: 3, timelineLabel: "3-5 days", sortOrder: 1, isPopular: true },
        { categoryId: createdCategories[2].id, name: "Custom Analytics Dashboard", description: "Real-time analytics dashboard", tooltip: "Visualize key metrics in your app", priceMin: 300, priceMax: 600, estimatedDays: 7, timelineLabel: "1-2 weeks", sortOrder: 2 },
        { categoryId: createdCategories[2].id, name: "SEO Optimization", description: "Technical SEO implementation", tooltip: "Meta tags, sitemap, structured data", priceMin: 200, priceMax: 400, estimatedDays: 5, timelineLabel: "1 week", sortOrder: 3 },
        // UI/UX Enhancements
        { categoryId: createdCategories[3].id, name: "AI Chatbot", description: "Conversational AI assistant", tooltip: "Dialogflow or OpenAI powered chatbot", priceMin: 400, priceMax: 800, estimatedDays: 10, timelineLabel: "1-2 weeks", sortOrder: 1, isPopular: true },
        { categoryId: createdCategories[3].id, name: "PWA Conversion", description: "Make your site installable", tooltip: "Offline support, push notifications", priceMin: 200, priceMax: 400, estimatedDays: 5, timelineLabel: "1 week", sortOrder: 2 },
        { categoryId: createdCategories[3].id, name: "Dark Mode", description: "Add dark/light theme toggle", tooltip: "System preference detection included", priceMin: 100, priceMax: 200, estimatedDays: 2, timelineLabel: "2-3 days", sortOrder: 3 },
        { categoryId: createdCategories[3].id, name: "Multi-language Support", description: "Internationalization (i18n)", tooltip: "Add support for multiple languages", priceMin: 300, priceMax: 600, estimatedDays: 7, timelineLabel: "1-2 weeks", sortOrder: 4 },
        // Integrations
        { categoryId: createdCategories[4].id, name: "Mailchimp Integration", description: "Email marketing automation", tooltip: "Newsletter signup, automated campaigns", priceMin: 200, priceMax: 400, estimatedDays: 4, timelineLabel: "4-5 days", sortOrder: 1, isPopular: true },
        { categoryId: createdCategories[4].id, name: "Zapier Integration", description: "Connect to 5000+ apps", tooltip: "Automate workflows with Zapier", priceMin: 250, priceMax: 500, estimatedDays: 5, timelineLabel: "1 week", sortOrder: 2 },
        { categoryId: createdCategories[4].id, name: "Social Sharing", description: "Share buttons for social media", tooltip: "Share to Twitter, Facebook, LinkedIn", priceMin: 100, priceMax: 200, estimatedDays: 2, timelineLabel: "2-3 days", sortOrder: 3 },
        { categoryId: createdCategories[4].id, name: "Push Notifications", description: "Browser push notifications", tooltip: "Re-engage users with timely updates", priceMin: 300, priceMax: 500, estimatedDays: 5, timelineLabel: "1 week", sortOrder: 4 },
        // Custom
        { categoryId: createdCategories[5].id, name: "Custom Feature", description: "Describe your custom requirement", tooltip: "We'll provide a custom quote based on your needs", priceMin: 0, priceMax: 0, estimatedDays: 0, timelineLabel: "Varies", sortOrder: 1 },
      ];

      for (const item of items) {
        await storage.createAddOnItem(item);
      }

      res.json({ message: "Default add-ons seeded successfully", categoriesCreated: createdCategories.length, itemsCreated: items.length });
    } catch (error) {
      console.error("Error seeding add-ons:", error);
      res.status(500).json({ message: "Failed to seed add-ons" });
    }
  });

  // ============ DOCUMENT TEMPLATE ROUTES (Admin) ============

  // Get all document templates (admin)
  app.get("/api/admin/document-templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templates = await storage.getAllDocumentTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching document templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Create document template (admin)
  app.post("/api/admin/document-templates", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const template = await storage.createDocumentTemplate(req.body);
      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating document template:", error);
      res.status(500).json({ message: "Failed to create template" });
    }
  });

  // Update document template (admin)
  app.patch("/api/admin/document-templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const template = await storage.updateDocumentTemplate(req.params.id, req.body);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error updating document template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });

  // Delete document template (admin)
  app.delete("/api/admin/document-templates/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      await storage.deleteDocumentTemplate(req.params.id);
      res.json({ message: "Template deleted" });
    } catch (error) {
      console.error("Error deleting document template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Seed default document templates (admin)
  app.post("/api/admin/document-templates/seed", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const templates = [
        {
          name: "Project Estimate",
          type: "estimate",
          bodyMarkdown: `# Project Estimate

## Project Details
- **Project ID:** {{submission_id}}
- **Client:** {{client_name}}
- **Date:** {{date}}

## Scope of Work
{{description}}

## Selected Features & Add-Ons
{{addons_list}}

## Pricing Summary
- **Base Range:** ${{budget_min}} - ${{budget_max}}
- **Add-Ons Total:** ${{addons_total}}
- **Estimated Total:** ${{total_min}} - ${{total_max}}

## Payment Schedule
1. **Deposit (30%):** Due upon approval
2. **Midpoint (40%):** Due when solution is proposed
3. **Final (30%):** Due upon completion

## Timeline
Estimated delivery: {{timeline}}

---
*This estimate is valid for 30 days from the date above.*`,
          version: 1,
          isActive: true,
          requiresSignature: false,
        },
        {
          name: "Service Contract",
          type: "contract",
          content: `# SERVICE CONTRACT

**Contract ID:** {{document_id}}
**Date:** {{date}}

## PARTIES
This Service Contract ("Contract") is entered into between:

**Service Provider:** SolveForge
**Client:** {{client_name}} ("Client")

## PROJECT DESCRIPTION
{{description}}

## DELIVERABLES
{{addons_list}}

## COMPENSATION
- **Total Project Value:** ${{total_min}} - ${{total_max}}
- **Deposit (30%):** ${{deposit_amount}} due upon signing
- **Midpoint (40%):** ${{midpoint_amount}} due upon solution proposal
- **Final (30%):** ${{final_amount}} due upon completion

## TIMELINE
Estimated completion: {{timeline}} from deposit receipt.

## TERMS AND CONDITIONS
1. **Scope Changes:** Any changes to the project scope will require a written amendment.
2. **Revisions:** Includes up to 2 rounds of revisions. Additional revisions billed at agreed hourly rate.
3. **Intellectual Property:** Upon full payment, all deliverables become Client property.
4. **Confidentiality:** Both parties agree to maintain confidentiality of proprietary information.
5. **Cancellation:** Either party may cancel with 14 days written notice.

## SIGNATURES

**Client Signature:** ___________________
**Date:** ___________________

**Service Provider:** ___________________
**Date:** ___________________

---
*By signing above, both parties agree to the terms outlined in this contract.*`,
          version: 1,
          isActive: true,
          requiresSignature: true,
        },
        {
          name: "Terms of Service",
          type: "terms",
          content: `# TERMS OF SERVICE

**Last Updated:** {{date}}

## 1. ACCEPTANCE OF TERMS
By using SolveForge services, you agree to these Terms of Service.

## 2. SERVICES
We provide custom software development and problem-solving services as described in individual project contracts.

## 3. USER RESPONSIBILITIES
- Provide accurate project information
- Respond to communications in a timely manner
- Make payments according to agreed schedules

## 4. PAYMENT TERMS
- Milestone-based payment structure (30/40/30)
- Payments are non-refundable once work has begun
- Payment processed via Stripe or cryptocurrency

## 5. INTELLECTUAL PROPERTY
Upon full payment, all custom work becomes client property.

## 6. LIMITATION OF LIABILITY
Our liability is limited to the total amount paid for services.

## 7. DISPUTE RESOLUTION
Disputes will be resolved through good-faith negotiation.

## 8. MODIFICATIONS
We may update these terms with notice to active clients.

---
*By proceeding with our services, you acknowledge acceptance of these terms.*`,
          version: 1,
          isActive: true,
          requiresSignature: false,
        },
      ];

      for (const template of templates) {
        await storage.createDocumentTemplate(template);
      }

      res.json({ message: "Default document templates seeded", count: templates.length });
    } catch (error) {
      console.error("Error seeding document templates:", error);
      res.status(500).json({ message: "Failed to seed templates" });
    }
  });

  // ============ DOCUMENT ROUTES ============

  // Get documents for a submission
  app.get("/api/submissions/:id/documents", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submission = await storage.getSubmission(req.params.id);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      if (submission.userId !== userId && !ADMIN_USER_IDS.has(userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const documents = await storage.getDocumentsBySubmission(req.params.id);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get single document
  app.get("/api/documents/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const document = await storage.getDocument(req.params.id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Check access via submission
      const submission = await storage.getSubmission(document.submissionId);
      if (!submission || (submission.userId !== userId && !ADMIN_USER_IDS.has(userId))) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Log view event
      await storage.createDocumentAuditLog({
        documentId: document.id,
        action: "viewed",
        performedBy: userId,
        metadata: { ip: req.ip },
      });
      
      // Update status to viewed if pending
      if (document.status === "sent") {
        await storage.updateDocument(document.id, { status: "viewed" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Create document from template (admin)
  app.post("/api/admin/submissions/:id/documents", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const submission = await storage.getSubmission(req.params.id);
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      const { templateId, type } = req.body;
      
      // Get template if provided
      let content = req.body.content || "";
      let templateName = req.body.name || "Document";
      
      if (templateId) {
        const template = await storage.getDocumentTemplate(templateId);
        if (template) {
          content = template.content;
          templateName = template.name;
        }
      }
      
      // Get add-ons for variable substitution
      const addons = await storage.getSubmissionAddOnsWithDetails(req.params.id);
      const addonsTotal = addons.reduce((sum, a) => sum + (a.priceMin || 0), 0);
      const addonsList = addons.map(a => `- ${a.itemName}: $${a.priceMin} - $${a.priceMax}`).join("\n");
      
      const budgetMin = submission.budgetMin || 0;
      const budgetMax = submission.budgetMax || 0;
      const totalMin = budgetMin + addonsTotal;
      const totalMax = budgetMax + addons.reduce((sum, a) => sum + (a.priceMax || 0), 0);
      
      // Replace template variables
      const renderedContent = content
        .replace(/\{\{submission_id\}\}/g, submission.id)
        .replace(/\{\{document_id\}\}/g, "DOC-" + Date.now())
        .replace(/\{\{client_name\}\}/g, submission.contactName || "Client")
        .replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
        .replace(/\{\{description\}\}/g, submission.description || "")
        .replace(/\{\{addons_list\}\}/g, addonsList || "No add-ons selected")
        .replace(/\{\{budget_min\}\}/g, budgetMin.toString())
        .replace(/\{\{budget_max\}\}/g, budgetMax.toString())
        .replace(/\{\{addons_total\}\}/g, addonsTotal.toString())
        .replace(/\{\{total_min\}\}/g, totalMin.toString())
        .replace(/\{\{total_max\}\}/g, totalMax.toString())
        .replace(/\{\{deposit_amount\}\}/g, (totalMin * 0.3).toFixed(0))
        .replace(/\{\{midpoint_amount\}\}/g, (totalMin * 0.4).toFixed(0))
        .replace(/\{\{final_amount\}\}/g, (totalMin * 0.3).toFixed(0))
        .replace(/\{\{timeline\}\}/g, submission.timeline || "To be determined");
      
      const document = await storage.createDocument({
        submissionId: req.params.id,
        templateId: templateId || null,
        type: type || "estimate",
        title: templateName,
        content: renderedContent,
        status: "draft",
      });
      
      // Log creation
      await storage.createDocumentAuditLog({
        documentId: document.id,
        action: "created",
        performedBy: (req.user as any).claims.sub,
      });
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Send document to client (admin)
  app.post("/api/admin/documents/:id/send", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const document = await storage.getDocument(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      const updated = await storage.updateDocument(document.id, {
        status: "sent",
        sentAt: new Date(),
      });
      
      await storage.createDocumentAuditLog({
        documentId: document.id,
        action: "sent",
        performedBy: (req.user as any).claims.sub,
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error sending document:", error);
      res.status(500).json({ message: "Failed to send document" });
    }
  });

  // Sign document (client)
  app.post("/api/documents/:id/sign", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const document = await storage.getDocument(req.params.id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      // Verify ownership
      const submission = await storage.getSubmission(document.submissionId);
      if (!submission || submission.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (document.status === "signed") {
        return res.status(400).json({ message: "Document already signed" });
      }
      
      const { signatureData, agreedToTerms } = req.body;
      
      if (!agreedToTerms) {
        return res.status(400).json({ message: "You must agree to the terms" });
      }
      
      const updated = await storage.updateDocument(document.id, {
        status: "signed",
        signedAt: new Date(),
      });
      
      // Create signer record
      await storage.createDocumentSigner({
        documentId: document.id,
        signerName: submission.contactName || "Client",
        signerEmail: submission.contactEmail || "",
        signerRole: "client",
        status: "signed",
        signedAt: new Date(),
        signatureData: signatureData || null,
        ipAddress: req.ip,
      });
      
      await storage.createDocumentAuditLog({
        documentId: document.id,
        action: "signed",
        performedBy: userId,
        metadata: { ip: req.ip, userAgent: req.get("User-Agent") },
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error signing document:", error);
      res.status(500).json({ message: "Failed to sign document" });
    }
  });

  // Check if contract is signed (for payment gates)
  app.get("/api/submissions/:id/contract-status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const submission = await storage.getSubmission(req.params.id);
      
      if (!submission) {
        return res.status(404).json({ message: "Submission not found" });
      }
      
      if (submission.userId !== userId && !ADMIN_USER_IDS.has(userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const signedContract = await storage.getSignedContractBySubmission(req.params.id);
      
      res.json({
        hasSignedContract: !!signedContract,
        contractId: signedContract?.id || null,
        signedAt: signedContract?.signedAt || null,
      });
    } catch (error) {
      console.error("Error checking contract status:", error);
      res.status(500).json({ message: "Failed to check contract status" });
    }
  });

  // Get document audit logs (admin)
  app.get("/api/admin/documents/:id/audit-logs", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const logs = await storage.getDocumentAuditLogs(req.params.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  return httpServer;
}
