import type { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { requestStrapiAsService } from "../../services/server/strapiClient";

type Body = {
  leadId?: string;
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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const LEAD_CONTACTS = gql`
  query LeadContacts($id: ID!) {
    lead(id: $id) {
      data {
        id
        attributes {
          lead_contacts(pagination: { start: 0, limit: 100 }) {
            data {
              id
            }
          }
        }
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

const isValid = (body: any): body is Body => {
  if (!body || typeof body !== "object") return false;
  if (body.leadId !== undefined && typeof body.leadId !== "string") return false;
  if (typeof body.name !== "string" || !body.name.trim()) return false;
  if (
    body.kid_age !== undefined &&
    (typeof body.kid_age !== "number" || Number.isNaN(body.kid_age))
  ) {
    return false;
  }
  if (body.country !== undefined && typeof body.country !== "string") return false;
  if (typeof body.contactChannel !== "string" || !body.contactChannel.trim()) return false;
  if (typeof body.contactValue !== "string" || !body.contactValue.trim()) return false;
  if (
    body.contactChannel.toLowerCase() === "email" &&
    !emailRegex.test(body.contactValue.trim())
  ) {
    return false;
  }
  if (
    typeof body.emailContact === "string" &&
    body.emailContact.trim() &&
    !emailRegex.test(body.emailContact.trim())
  ) {
    return false;
  }
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

  const body = req.body as Body;
  const {
    leadId: requestedLeadId,
    kid_age,
    country,
    emailContact,
  } = body;
  const name = body.name || "";
  const contactChannel = body.contactChannel || "";
  const contactValue = body.contactValue || "";
  const socialName = channelToSocialName(contactChannel);
  if (!socialName) {
    return res.status(400).json({ success: false, error: "Unsupported contact channel" });
  }

  try {
    const userAgentHeader = req.headers["user-agent"];
    const userAgent = typeof userAgentHeader === "string" ? userAgentHeader : "";

    const leadData = {
      name: name.trim(),
      status: "new",
      ...(typeof kid_age === "number" ? { kid_age } : {}),
      ...(country?.trim() ? { country: country.trim() } : {}),
      userAgent: `${userAgent} | web-quiz:${contactChannel}`,
    };

    let leadId = String(requestedLeadId || "").trim();
    if (leadId) {
      await requestStrapiAsService(UPDATE_LEAD, {
        id: leadId,
        data: leadData,
      });
    } else {
      const leadResult = (await requestStrapiAsService(CREATE_LEAD, {
        data: leadData,
      })) as { createLead?: { data?: { id?: string | number } } };

      leadId = String(leadResult?.createLead?.data?.id || "");
    }

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

    const existingLead = (await requestStrapiAsService(LEAD_CONTACTS, {
      id: leadId,
    })) as {
      lead?: {
        data?: {
          attributes?: {
            lead_contacts?: { data?: Array<{ id?: string | number }> };
          };
        };
      };
    };
    const existingContactIds =
      existingLead?.lead?.data?.attributes?.lead_contacts?.data
        ?.map((item) => String(item?.id || ""))
        .filter(Boolean) || [];

    await requestStrapiAsService(UPDATE_LEAD, {
      id: leadId,
      data: {
        lead_contacts: Array.from(new Set([...existingContactIds, ...contactIds])),
      },
    });

    return res.status(200).json({ success: true, leadId });
  } catch (error) {
    console.error("lead-quiz-submit failed", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
