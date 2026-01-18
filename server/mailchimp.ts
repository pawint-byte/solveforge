import crypto from 'crypto';

const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

function getMailchimpDataCenter(): string | null {
  if (!MAILCHIMP_API_KEY) return null;
  const parts = MAILCHIMP_API_KEY.split('-');
  return parts.length > 1 ? parts[1] : null;
}

function getSubscriberHash(email: string): string {
  return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
}

export async function addSubscriberToMailchimp(email: string, source?: string): Promise<boolean> {
  const dataCenter = getMailchimpDataCenter();
  if (!dataCenter || !MAILCHIMP_LIST_ID) {
    console.log('Mailchimp not configured, skipping sync');
    return false;
  }

  const subscriberHash = getSubscriberHash(email);
  const url = `https://${dataCenter}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: email,
        status_if_new: 'subscribed',
        status: 'subscribed',
        merge_fields: {},
        tags: source ? [source] : ['website'],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Mailchimp error:', error);
      return false;
    }

    console.log(`Subscriber ${email} synced to Mailchimp`);
    return true;
  } catch (error) {
    console.error('Failed to sync with Mailchimp:', error);
    return false;
  }
}

export async function removeSubscriberFromMailchimp(email: string): Promise<boolean> {
  const dataCenter = getMailchimpDataCenter();
  if (!dataCenter || !MAILCHIMP_LIST_ID) {
    console.log('Mailchimp not configured, skipping sync');
    return false;
  }

  const subscriberHash = getSubscriberHash(email);
  const url = `https://${dataCenter}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'unsubscribed',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Mailchimp error:', error);
      return false;
    }

    console.log(`Subscriber ${email} unsubscribed from Mailchimp`);
    return true;
  } catch (error) {
    console.error('Failed to update Mailchimp:', error);
    return false;
  }
}

export async function updateSubscriberTags(email: string, tags: string[]): Promise<boolean> {
  const dataCenter = getMailchimpDataCenter();
  if (!dataCenter || !MAILCHIMP_LIST_ID) {
    return false;
  }

  const subscriberHash = getSubscriberHash(email);
  const url = `https://${dataCenter}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/${subscriberHash}/tags`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `apikey ${MAILCHIMP_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags: tags.map(tag => ({ name: tag, status: 'active' })),
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to update tags:', error);
    return false;
  }
}

export function isMailchimpConfigured(): boolean {
  return !!(MAILCHIMP_API_KEY && MAILCHIMP_LIST_ID);
}
