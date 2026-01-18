// Google Analytics 4 integration with UTM tracking support

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Parse UTM parameters from URL
export const getUTMParams = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  
  const params = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};
  
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  utmKeys.forEach(key => {
    const value = params.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });
  
  return utmParams;
};

// Store UTM params in session storage for attribution
export const storeUTMParams = () => {
  const utmParams = getUTMParams();
  if (Object.keys(utmParams).length > 0) {
    sessionStorage.setItem('utm_params', JSON.stringify(utmParams));
  }
};

// Get stored UTM params
export const getStoredUTMParams = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const stored = sessionStorage.getItem('utm_params');
  return stored ? JSON.parse(stored) : {};
};

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Missing Google Analytics Measurement ID');
    return;
  }

  // Add Google Analytics script
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script1);

  // Initialize gtag with UTM parameters
  const utmParams = getUTMParams();
  storeUTMParams();
  
  const script2 = document.createElement('script');
  script2.textContent = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', ${JSON.stringify({
      ...utmParams,
      send_page_view: true
    })});
  `;
  document.head.appendChild(script2);
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url,
    ...getStoredUTMParams()
  });
};

// Track custom events
export const trackEvent = (
  action: string, 
  category?: string, 
  label?: string, 
  value?: number,
  additionalParams?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...getStoredUTMParams(),
    ...additionalParams
  });
};

// Specific tracking functions for common events
export const trackSubmissionCreated = (submissionId: string, category: string) => {
  trackEvent('submission_created', 'engagement', category, undefined, { submission_id: submissionId });
};

export const trackPaymentStarted = (submissionId: string, amount: number) => {
  trackEvent('begin_checkout', 'ecommerce', 'deposit', amount, { submission_id: submissionId });
};

export const trackPaymentCompleted = (submissionId: string, amount: number) => {
  trackEvent('purchase', 'ecommerce', 'payment_complete', amount, { submission_id: submissionId });
};

export const trackSignUp = (method: string) => {
  trackEvent('sign_up', 'engagement', method);
};

export const trackLogin = (method: string) => {
  trackEvent('login', 'engagement', method);
};

export const trackShare = (platform: string, contentType: string, itemId?: string) => {
  trackEvent('share', 'engagement', platform, undefined, { content_type: contentType, item_id: itemId });
};

export const trackReferralClick = (referralCode: string) => {
  trackEvent('referral_click', 'referral', referralCode);
};
