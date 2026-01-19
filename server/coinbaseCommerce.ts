import coinbase from 'coinbase-commerce-node';

const Client = coinbase.Client;
const Charge = coinbase.resources.Charge;
const Webhook = coinbase.Webhook;

// Initialize the client if API key is available
const apiKey = process.env.COINBASE_COMMERCE_API_KEY;
if (apiKey) {
  Client.init(apiKey);
}

export interface CryptoChargeData {
  name: string;
  description: string;
  amount: string;
  currency: string;
  metadata?: Record<string, string>;
  redirectUrl?: string;
  cancelUrl?: string;
}

export interface CryptoChargeResponse {
  id: string;
  hostedUrl: string;
  code: string;
  expiresAt: string;
}

export async function createCryptoCharge(data: CryptoChargeData): Promise<CryptoChargeResponse> {
  if (!apiKey) {
    throw new Error('Coinbase Commerce API key not configured');
  }

  const chargeData = {
    name: data.name,
    description: data.description,
    local_price: {
      amount: data.amount,
      currency: data.currency,
    },
    pricing_type: 'fixed_price',
    metadata: data.metadata || {},
    redirect_url: data.redirectUrl,
    cancel_url: data.cancelUrl,
  };

  const charge = await Charge.create(chargeData);
  
  return {
    id: charge.id,
    hostedUrl: charge.hosted_url,
    code: charge.code,
    expiresAt: charge.expires_at,
  };
}

export function verifyWebhookSignature(rawBody: Buffer, signature: string): any {
  const webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Coinbase Commerce webhook secret not configured');
  }
  
  const event = Webhook.verifyEventBody(rawBody.toString(), signature, webhookSecret);
  return event;
}

export function isCoinbaseCommerceConfigured(): boolean {
  return !!apiKey;
}
