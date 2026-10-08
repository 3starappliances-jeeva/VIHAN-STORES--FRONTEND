/**
 * Site-wide configuration. Everything a shop owner would want to change lives here
 * (or in .env — see .env.example). Bracketed values are placeholders to fill.
 */
const env = import.meta.env;

export const site = {
  name: env.VITE_APP_NAME ?? 'Vihaan Natural Care',
  shortName: 'Vihaan',
  tagline: 'Good food, happy tummies',
  origin: 'Arambakkam, Thiruvallur District, Tamil Nadu',
  whatsappNumber: env.VITE_WHATSAPP_NUMBER ?? '919342022499',
  supportPhone: env.VITE_SUPPORT_PHONE ?? '[+91 XXXXX XXXXX]',
  supportHours: '9 AM – 7 PM, Mon–Sat',
  supportEmail: '[support email]',
  fssai: env.VITE_FSSAI_LICENCE ?? '[FSSAI licence number]',
  address: '[Registered address]',
  currency: 'INR',
  freeShippingThreshold: Number(env.VITE_FREE_SHIPPING_THRESHOLD ?? 499),
  codFee: Number(env.VITE_COD_FEE ?? 29),
  expressFee: 79,
  gstRate: 0.05,
  cashbackRate: 0.02, // 2% wallet cashback on prepaid orders
  dispatchCutoff: '4:00 PM',
  useMockApi: (env.VITE_USE_MOCK_API ?? 'true') === 'true',
  apiBaseUrl: env.VITE_API_BASE_URL ?? '/api',
  /** demo OTP accepted by the mock auth adapter */
  demoOtp: '123456',
  social: { instagram: '#', facebook: '#', youtube: '#' },
} as const;

export const whatsappLink = (text = 'Hi Vihaan, I have a question about an order') =>
  `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(text)}`;
