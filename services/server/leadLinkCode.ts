import { createHmac } from "crypto";

const DEFAULT_TTL_SEC = 60 * 60 * 24 * 7;

const getSecret = () =>
  process.env.LEAD_TELEGRAM_LINK_SECRET ||
  process.env.LEADS_DASHBOARD_SESSION_SECRET ||
  "dev-lead-telegram-secret-change-me";

const sign = (payload: string) =>
  createHmac("sha256", getSecret()).update(payload).digest("base64url");

export const generateLeadStartCode = (leadId: string, ttlSec = DEFAULT_TTL_SEC) => {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const idPart = Buffer.from(String(leadId), "utf8").toString("base64url");
  const expPart = exp.toString(36);
  const payload = `${idPart}.${expPart}`;
  const signature = sign(payload).slice(0, 16);
  // Telegram deep-link param should stay short and url-safe.
  return `l${idPart}_${expPart}_${signature}`;
};
