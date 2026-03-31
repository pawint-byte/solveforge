import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const ADMIN_EMAILS = ['peter@wintenterprises.com', 'peterjr@wintenterprises.com'];
const FROM_EMAIL = 'notifications@wintenterprises.com';

export async function isEmailAvailable(): Promise<boolean> {
  return !!resend;
}

export async function sendAdminNewSubmissionNotification(submission: {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  category: string;
  timeline: string;
  userEmail?: string;
}): Promise<boolean> {
  if (!resend) {
    console.log('Email not configured - skipping admin notification');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Wint Enterprises <${FROM_EMAIL}>`,
      to: ADMIN_EMAILS,
      subject: `🆕 New Submission: ${submission.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">New Problem Submission</h1>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1F2937;">${submission.title}</h2>
            <p style="color: #4B5563;">${submission.description.substring(0, 500)}${submission.description.length > 500 ? '...' : ''}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Category:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${submission.category}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Budget:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">$${submission.budgetMin} - $${submission.budgetMax}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Timeline:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${submission.timeline}</td>
            </tr>
            ${submission.userEmail ? `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>User Email:</strong></td>
              <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${submission.userEmail}</td>
            </tr>
            ` : ''}
          </table>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://solveforge.pawint-app.com/admin" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View in Admin Dashboard
            </a>
          </div>
          
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 30px; text-align: center;">
            Submission ID: ${submission.id}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send admin notification:', error);
      return false;
    }

    console.log('Admin notification sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

export async function sendUserSubmissionConfirmation(userEmail: string, submission: {
  id: string;
  title: string;
}): Promise<boolean> {
  if (!resend) {
    console.log('Email not configured - skipping user confirmation');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Wint Enterprises <${FROM_EMAIL}>`,
      to: [userEmail],
      subject: `✅ Submission Received: ${submission.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">We've Received Your Submission!</h1>
          
          <p>Thank you for submitting your problem to SolveForge. Our team will review your submission and get back to you soon.</p>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1F2937;">${submission.title}</h2>
            <p style="color: #4B5563;">Status: <strong>Pending Review</strong></p>
          </div>
          
          <h3>What happens next?</h3>
          <ol style="color: #4B5563;">
            <li>Our team reviews your submission (usually within 24-48 hours)</li>
            <li>We may reach out with questions via our messaging system</li>
            <li>Once approved, we'll send you a project estimate</li>
            <li>After your approval, work begins!</li>
          </ol>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://solveforge.pawint-app.com/dashboard" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Dashboard
            </a>
          </div>
          
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 30px; text-align: center;">
            Reference: ${submission.id}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send user confirmation:', error);
      return false;
    }

    console.log('User confirmation sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}

export async function sendStatusUpdateNotification(userEmail: string, submission: {
  id: string;
  title: string;
  status: string;
  message?: string;
}): Promise<boolean> {
  if (!resend) {
    console.log('Email not configured - skipping status update');
    return false;
  }

  const statusLabels: Record<string, string> = {
    pending: 'Pending Review',
    in_review: 'Under Review',
    approved: 'Approved',
    in_progress: 'In Progress',
    solution_proposed: 'Solution Ready',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };

  try {
    const { data, error } = await resend.emails.send({
      from: `Wint Enterprises <${FROM_EMAIL}>`,
      to: [userEmail],
      subject: `📋 Status Update: ${submission.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Your Submission Status Has Changed</h1>
          
          <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1F2937;">${submission.title}</h2>
            <p style="color: #4B5563;">New Status: <strong style="color: #4F46E5;">${statusLabels[submission.status] || submission.status}</strong></p>
          </div>
          
          ${submission.message ? `
          <div style="background: #EEF2FF; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4F46E5;">
            <p style="margin: 0; color: #4B5563;">${submission.message}</p>
          </div>
          ` : ''}
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="https://solveforge.pawint-app.com/dashboard" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Details
            </a>
          </div>
          
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 30px; text-align: center;">
            Reference: ${submission.id}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Failed to send status update:', error);
      return false;
    }

    console.log('Status update sent:', data?.id);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
}
