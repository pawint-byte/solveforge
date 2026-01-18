import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { insertSubmissionSchema, insertMessageSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

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

  return httpServer;
}
