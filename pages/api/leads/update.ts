import type { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { requestStrapiAsService } from "../../../services/server/strapiClient";
import { hasValidLeadsSession } from "../../../services/server/leadsSession";
import { LeadDraft } from "../../../types/lead";

type Body = LeadDraft & {
  id: string;
};

type ResponseBody = {
  success: boolean;
  leadId?: string;
  error?: string;
};

const UPDATE_LEAD = gql`
  mutation UpdateLead($id: ID!, $data: LeadInput!) {
    updateLead(id: $id, data: $data) {
      data {
        id
      }
    }
  }
`;

const isValidBody = (body: any): body is Body => {
  if (!body || typeof body !== "object") return false;
  if (typeof body.id !== "string" || !body.id.trim()) return false;
  if (typeof body.name !== "string") return false;
  if (typeof body.status !== "string" || !body.status.trim()) return false;
  if (typeof body.kid_age !== "string") return false;
  if (typeof body.countryId !== "string") return false;
  if (typeof body.userAgent !== "string") return false;
  if (typeof body.admin_comment !== "string") return false;
  return true;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  if (!hasValidLeadsSession(req)) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (!isValidBody(req.body)) {
    return res.status(400).json({ success: false, error: "Invalid payload" });
  }

  const body = req.body as Body;
  const kidAge = body.kid_age.trim();

  const data: {
    name: string;
    status: string;
    userAgent: string;
    admin_comment: string;
    kid_age: number | null;
    country: string | null;
  } = {
    name: body.name.trim(),
    status: body.status,
    userAgent: body.userAgent,
    admin_comment: body.admin_comment,
    kid_age: null,
    country: null,
  };

  data.kid_age = kidAge ? Number(kidAge) : null;
  data.country = body.countryId ? body.countryId : null;

  if (data.kid_age !== null && Number.isNaN(data.kid_age)) {
    return res.status(400).json({ success: false, error: "Invalid kid_age" });
  }

  try {
    const id = body.id.trim();
    const result = (await requestStrapiAsService(UPDATE_LEAD, {
      id,
      data,
    })) as { updateLead?: { data?: { id?: string | number } } };

    const leadId = String(result?.updateLead?.data?.id || "");
    if (!leadId) {
      return res.status(502).json({ success: false, error: "Lead not updated" });
    }

    return res.status(200).json({ success: true, leadId });
  } catch (error) {
    console.error("Leads update failed", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
