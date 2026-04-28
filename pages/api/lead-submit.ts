import type { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
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

const SOCIAL_BY_NAME = gql`
  query SocialByName($name: String!) {
    socialnetworks(filters: { name: { eqi: $name } }, pagination: { start: 0, limit: 1 }) {
      data {
        id
      }
    }
  }
`;

const CREATE_LEAD_CONTACT = gql`
  mutation CreateLeadContact($data: LeadContactInput!) {
    createLeadContact(data: $data) {
      data {
        id
      }
    }
  }
`;

const UPDATE_LEAD = gql`
  mutation UpdateLead($id: ID!, $data: LeadInput!) {
    updateLead(id: $id, data: $data) {
      data {
        id
      }
    }
  }
`;

const isValidBody = (body: any): body is LeadSubmitBody => {
  if (!body || typeof body !== "object") return false;
  if (typeof body.name !== "string" || !body.name.trim()) return false;
  if (typeof body.email !== "string" || !body.email.trim()) return false;
  if (typeof body.kid_age !== "number" || Number.isNaN(body.kid_age)) return false;
  if (typeof body.country !== "string" || !body.country.trim()) return false;
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

  const { name, email, kid_age, country, honeypot } = req.body as Required<LeadSubmitBody>;
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
        kid_age,
        country: country.trim(),
        userAgent,
      },
    })) as { createLead?: { data?: { id?: string | number } } };

    const leadIdRaw = result?.createLead?.data?.id;
    if (!leadIdRaw) {
      return res.status(502).json({ success: false, error: "Lead not created" });
    }

    const leadId = String(leadIdRaw);
    const socialResult = (await requestStrapiAsService(SOCIAL_BY_NAME, {
      name: "Email",
    })) as { socialnetworks?: { data?: Array<{ id?: string | number }> } };
    const socialId = String(socialResult?.socialnetworks?.data?.[0]?.id || "");
    if (!socialId) {
      return res.status(404).json({ success: false, error: "Socialnetwork not found: Email" });
    }

    const leadContactResult = (await requestStrapiAsService(CREATE_LEAD_CONTACT, {
      data: {
        socialnetwork: socialId,
        user_id: email.trim(),
        username: email.trim(),
        isBanned: false,
        isCallForbidden: false,
      },
    })) as { createLeadContact?: { data?: { id?: string | number } } };
    const contactId = String(leadContactResult?.createLeadContact?.data?.id || "");
    if (!contactId) {
      return res.status(502).json({ success: false, error: "Lead contact not created" });
    }

    await requestStrapiAsService(UPDATE_LEAD, {
      id: leadId,
      data: {
        lead_contacts: [contactId],
      },
    });

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
