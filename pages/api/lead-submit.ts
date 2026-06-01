import type { NextApiRequest, NextApiResponse } from "next";
import { requestStrapiAsService } from "../../services/server/strapiClient";
import { createLeadMutation } from "../../services/queries";
import { generateLeadStartCode } from "../../services/server/leadLinkCode";

type LeadSubmitBody = {
  name?: string;
  email?: string;
  kid_age?: number;
  country?: string;
  honeypot?: string;
};

type LeadSubmitResponse = {
  success: boolean;
  leadId?: string;
  leadStartCode?: string;
  telegramStartCode?: string;
  error?: string;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidBody = (body: any): body is LeadSubmitBody => {
  if (!body || typeof body !== "object") return false;
  if (typeof body.name !== "string" || !body.name.trim()) return false;
  if (typeof body.email !== "string" || !body.email.trim()) return false;
  if (!emailRegex.test(body.email.trim())) return false;
  if (
    body.kid_age !== undefined &&
    (typeof body.kid_age !== "number" || Number.isNaN(body.kid_age))
  ) {
    return false;
  }
  if (body.country !== undefined && typeof body.country !== "string") return false;
  if (typeof body.honeypot !== "string") return false;
  return true;
};

const submitCooldownMs = 20_000;
const submitByIp = new Map<string, number>();

const getClientIp = (req: NextApiRequest) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0]?.trim() || "";
  if (Array.isArray(forwarded) && forwarded.length) return forwarded[0] || "";
  return req.socket.remoteAddress || "";
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LeadSubmitResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  if (!isValidBody(req.body)) {
    return res.status(400).json({ success: false, error: "Invalid payload" });
  }

  const body = req.body as LeadSubmitBody;
  const name = body.name || "";
  const email = body.email || "";
  const kid_age = body.kid_age;
  const country = body.country || "";
  const honeypot = body.honeypot || "";
  if (honeypot.trim()) {
    // pretend success to not teach bots
    return res.status(200).json({ success: true });
  }

  const ip = getClientIp(req);
  const lastSubmit = submitByIp.get(ip) || 0;
  if (Date.now() - lastSubmit < submitCooldownMs) {
    return res.status(429).json({ success: false, error: "Too many requests" });
  }
  submitByIp.set(ip, Date.now());

  const userAgentHeader = req.headers["user-agent"];
  const userAgent = typeof userAgentHeader === "string" ? userAgentHeader : "";

  try {
    const result = (await requestStrapiAsService(createLeadMutation, {
      data: {
        name: name.trim(),
        status: "not_verified",
        ...(typeof kid_age === "number" ? { kid_age } : {}),
        ...(country?.trim() ? { country: country.trim() } : {}),
        userAgent,
      },
    })) as { createLead?: { data?: { id?: string | number } } };

    const leadIdRaw = result?.createLead?.data?.id;
    if (!leadIdRaw) {
      return res.status(502).json({ success: false, error: "Lead not created" });
    }

    const leadId = String(leadIdRaw);
    const leadStartCode = generateLeadStartCode(leadId);
    return res.status(200).json({
      success: true,
      leadId,
      leadStartCode,
      telegramStartCode: leadStartCode,
    });
  } catch (error) {
    console.error("Lead submit failed", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
