import type { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { requestStrapiAsService } from "../../services/server/strapiClient";

type Body = {
  name?: string;
  kid_age?: number;
  country?: string;
  contactChannel?: string;
  contactValue?: string;
  emailContact?: string;
};

type ApiResponse = {
  success: boolean;
  leadId?: string;
  error?: string;
};

const CREATE_LEAD = gql`
  mutation CreateLead($data: LeadInput!) {
    createLead(data: $data) {
      data {
        id
      }
    }
  }
`;

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

const channelToSocialName = (channel: string) => {
  const c = String(channel || "").toLowerCase();
  if (c === "email") return "Email";
  if (c === "instagram") return "Instagram";
  if (c === "vk") return "VK";
  return "";
};

const isValid = (body: any): body is Required<Body> => {
  if (!body || typeof body !== "object") return false;
  if (typeof body.name !== "string" || !body.name.trim()) return false;
  if (typeof body.kid_age !== "number" || Number.isNaN(body.kid_age)) return false;
  if (typeof body.country !== "string" || !body.country.trim()) return false;
  if (typeof body.contactChannel !== "string" || !body.contactChannel.trim()) return false;
  if (typeof body.contactValue !== "string" || !body.contactValue.trim()) return false;
  return true;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  if (!isValid(req.body)) {
    return res.status(400).json({ success: false, error: "Invalid payload" });
  }

  const { name, kid_age, country, contactChannel, contactValue, emailContact } = req.body;
  const socialName = channelToSocialName(contactChannel);
  if (!socialName) {
    return res.status(400).json({ success: false, error: "Unsupported contact channel" });
  }

  try {
    const userAgentHeader = req.headers["user-agent"];
    const userAgent = typeof userAgentHeader === "string" ? userAgentHeader : "";

    const leadResult = (await requestStrapiAsService(CREATE_LEAD, {
      data: {
        name: name.trim(),
        status: "new",
        kid_age,
        country: country.trim(),
        userAgent: `${userAgent} | web-quiz:${contactChannel}`,
      },
    })) as { createLead?: { data?: { id?: string | number } } };

    const leadId = String(leadResult?.createLead?.data?.id || "");
    if (!leadId) {
      return res.status(502).json({ success: false, error: "Lead not created" });
    }

    const createContact = async (name: string, value: string) => {
      const socialResult = (await requestStrapiAsService(SOCIAL_BY_NAME, {
        name,
      })) as { socialnetworks?: { data?: Array<{ id?: string | number }> } };
      const socialId = String(socialResult?.socialnetworks?.data?.[0]?.id || "");
      if (!socialId) {
        throw new Error(`Socialnetwork not found: ${name}`);
      }

      const leadContactResult = (await requestStrapiAsService(CREATE_LEAD_CONTACT, {
        data: {
          socialnetwork: socialId,
          user_id: value.trim(),
          username: value.trim(),
          isBanned: false,
          isCallForbidden: false,
        },
      })) as { createLeadContact?: { data?: { id?: string | number } } };
      const contactId = String(leadContactResult?.createLeadContact?.data?.id || "");
      if (!contactId) {
        throw new Error("Lead contact not created");
      }
      return contactId;
    };

    const contactIds = [await createContact(socialName, contactValue)];
    const normalizedEmail = String(emailContact || "").trim();
    if (
      normalizedEmail &&
      (socialName !== "Email" || normalizedEmail !== contactValue.trim())
    ) {
      contactIds.push(await createContact("Email", normalizedEmail));
    }

    await requestStrapiAsService(UPDATE_LEAD, {
      id: leadId,
      data: {
        lead_contacts: contactIds,
      },
    });

    return res.status(200).json({ success: true, leadId });
  } catch (error) {
    console.error("lead-quiz-submit failed", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
