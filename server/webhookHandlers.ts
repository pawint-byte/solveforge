import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    try {
      const sync = await getStripeSync();
      await sync.processWebhook(payload, signature);
    } catch (syncErr: any) {
      console.log('Stripe sync webhook processing skipped:', syncErr.message);
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret) {
      try {
        const stripe = await getUncachableStripeClient();
        const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        await WebhookHandlers.handleEvent(event);
        console.log(`Webhook event processed: ${event.type}`);
      } catch (err: any) {
        console.log('Custom webhook handling error:', err.message);
      }
    } else {
      console.log('STRIPE_WEBHOOK_SECRET not set - skipping custom event handling');
    }
  }

  static async handleEvent(event: any): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await WebhookHandlers.handleCheckoutCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        await WebhookHandlers.handlePaymentSucceeded(event.data.object);
        break;
      default:
        break;
    }
  }

  static async handleCheckoutCompleted(session: any): Promise<void> {
    const paymentId = session.metadata?.paymentId;
    const submissionId = session.metadata?.submissionId;
    
    if (paymentId) {
      // Update payment record to completed
      await storage.updatePayment(paymentId, {
        status: 'completed',
        paidAt: new Date(),
        stripePaymentId: session.payment_intent || session.id,
      });
      
      console.log(`Payment ${paymentId} marked as completed`);
    }

    // Update submission status if this was a deposit payment
    if (submissionId && session.metadata?.type === 'deposit') {
      const submission = await storage.getSubmission(submissionId);
      if (submission && submission.status === 'approved') {
        await storage.updateSubmission(submissionId, { status: 'in_progress' });
        console.log(`Submission ${submissionId} status updated to in_progress`);
      }
    }
  }

  static async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
    const payment = await storage.getPaymentByStripeId(paymentIntent.id);
    
    if (payment && payment.status !== 'completed') {
      await storage.updatePayment(payment.id, {
        status: 'completed',
        paidAt: new Date(),
      });
      
      console.log(`Payment ${payment.id} marked as completed via payment_intent`);
    }
  }
}
