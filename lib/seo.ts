export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "https://bloomshop.co.ke";

  return raw.replace(/\/+$/, "");
}

export const SITE_NAME = "BloomShop";
export const SITE_DESCRIPTION =
  "Shop premium streetwear, sneakers, heavyweight t-shirts, fleece hoodies, and everyday accessories at BloomShop in Thika, Kenya. Fast countrywide delivery and instant WhatsApp support.";
export const STORE_PHONE = "+254716836551";
export const STORE_EMAIL = "hello@bloomshop.com";
