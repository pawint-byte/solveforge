// Affiliate Marketing Hooks - ShareASale Integration Preparation
// This module provides hooks for future affiliate marketing integration

declare global {
  interface Window {
    affiliateId?: string;
    affiliateNetwork?: string;
  }
}

interface AffiliateParams {
  affiliateId?: string;
  subId?: string;
  network?: string;
}

// Parse affiliate parameters from URL
export const getAffiliateParams = (): AffiliateParams => {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  
  return {
    affiliateId: params.get('aff') || params.get('affiliate_id') || undefined,
    subId: params.get('sub_id') || params.get('click_id') || undefined,
    network: params.get('network') || 'shareasale',
  };
};

// Store affiliate info in session for attribution
export const storeAffiliateParams = () => {
  const affiliate = getAffiliateParams();
  if (affiliate.affiliateId) {
    sessionStorage.setItem('affiliate_data', JSON.stringify({
      ...affiliate,
      landingTime: new Date().toISOString(),
      landingPage: window.location.pathname,
    }));
    window.affiliateId = affiliate.affiliateId;
    window.affiliateNetwork = affiliate.network;
  }
};

// Get stored affiliate data
export const getStoredAffiliateData = (): AffiliateParams & { landingTime?: string; landingPage?: string } | null => {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem('affiliate_data');
  return stored ? JSON.parse(stored) : null;
};

// Track affiliate conversion (to be called on successful payment)
export const trackAffiliateConversion = (orderId: string, amount: number, currency: string = 'USD') => {
  const affiliate = getStoredAffiliateData();
  
  if (!affiliate?.affiliateId) return;

  // ShareASale pixel tracking (placeholder - implement when API key is available)
  // This is where you'd fire the ShareASale conversion tracking pixel
  const conversionData = {
    merchant_id: '', // Add ShareASale merchant ID
    amount: amount.toFixed(2),
    order_id: orderId,
    currency,
    affiliate_id: affiliate.affiliateId,
    sub_id: affiliate.subId,
  };

  console.log('Affiliate conversion tracked:', conversionData);
  
  // For ShareASale, you would add an image pixel:
  // const img = new Image();
  // img.src = `https://www.shareasale.com/sale.cfm?amount=${amount}&tracking=${orderId}&merchantID=YOUR_ID`;
  
  // Store conversion for backend reporting
  try {
    fetch('/api/affiliate/conversion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(conversionData),
    });
  } catch (error) {
    console.error('Failed to track affiliate conversion:', error);
  }
};

// Initialize affiliate tracking on page load
export const initAffiliateTracking = () => {
  if (typeof window === 'undefined') return;
  
  storeAffiliateParams();
  
  // Add listener for payment success to track conversions
  window.addEventListener('payment_success', ((event: CustomEvent) => {
    const { orderId, amount, currency } = event.detail;
    trackAffiliateConversion(orderId, amount, currency);
  }) as EventListener);
};
