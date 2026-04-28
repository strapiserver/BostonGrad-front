import type { NextApiRequest, NextApiResponse } from "next";
import { requestStrapiAsService } from "../../../services/server/strapiClient";
import { hasValidLeadsSession } from "../../../services/server/leadsSession";
import { LeadItem } from "../../../types/lead";

type ResponseBody = {
  success: boolean;
  leads?: LeadItem[];
  error?: string;
};

const LEADS_QUERY = `
  query LeadsDashboard {
    leads(sort: "createdAt:desc", pagination: { start: 0, limit: 300 }) {
      data {
        id
        attributes {
          name
          status
          kid_age
          userAgent
          admin_comment
          createdAt
          country {
            data {
              id
              attributes {
                name
              }
            }
          }
          lead_contacts {
            data {
              id
              attributes {
                username
                user_id
                isBanned
                isCallForbidden
                socialnetwork {
                  data {
                    id
                    attributes {
                      name
                    }
                  }
                }
              }
            }
          }
          responses(pagination: { start: 0, limit: 300 }) {
            data {
              id
              attributes {
                answer
                question {
                  data {
                    id
                    attributes {
                      name
                      text
                      stage
                      isBoolean
                      isOptional
                      options {
                        __typename
                        ... on ComponentSharedOption {
                          option
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const normalizeLeads = (raw: any): LeadItem[] => {
  const rows = raw?.leads?.data || [];
  if (!Array.isArray(rows)) return [];

  return rows.map((item: any) => {
    const attrs = item?.attributes || {};
    const responses = Array.isArray(attrs?.responses?.data)
      ? attrs.responses.data
      : [];
    const leadContacts = Array.isArray(attrs?.lead_contacts?.data)
      ? attrs.lead_contacts.data
      : [];

    return {
      id: String(item?.id || ""),
      name: attrs?.name || "",
      status: attrs?.status || "",
      kid_age: Number.isFinite(attrs?.kid_age) ? attrs.kid_age : null,
      country: attrs?.country?.data
        ? {
            id: String(attrs.country.data.id || ""),
            name: attrs.country.data.attributes?.name || "",
          }
        : null,
      userAgent: attrs?.userAgent || "",
      admin_comment: attrs?.admin_comment || "",
      createdAt: attrs?.createdAt || "",
      responses: responses.map((r: any) => {
        const ra = r?.attributes || {};
        const qd = ra?.question?.data;
        const qa = qd?.attributes || null;
        const optionRows = Array.isArray(qa?.options) ? qa.options : [];
        const options = optionRows
          .map((opt: any) => opt?.option)
          .filter((v: any): v is string => typeof v === "string" && !!v.trim());

        return {
          id: String(r?.id || ""),
          answer: ra?.answer || "",
          question: qa
            ? {
                id: String(qd?.id || ""),
                name: qa?.name || "",
                text: qa?.text || "",
                stage: Number.isFinite(qa?.stage) ? qa.stage : null,
                isBoolean: Boolean(qa?.isBoolean),
                isOptional: qa?.isOptional !== false,
                options,
              }
            : null,
        };
      }).sort((a: any, b: any) => {
        const sa = a?.question?.stage;
        const sb = b?.question?.stage;
        if (typeof sa !== "number" && typeof sb !== "number") return 0;
        if (typeof sa !== "number") return 1;
        if (typeof sb !== "number") return -1;
        return sa - sb;
      }),
      lead_contacts: leadContacts.map((contact: any) => {
        const ca = contact?.attributes || {};
        return {
          id: String(contact?.id || ""),
          user_id: ca?.user_id || "",
          username: ca?.username || "",
          isBanned: Boolean(ca?.isBanned),
          isCallForbidden: Boolean(ca?.isCallForbidden),
          socialnetworkName: ca?.socialnetwork?.data?.attributes?.name || "",
        };
      }),
    };
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  if (!hasValidLeadsSession(req)) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  try {
    const data = await requestStrapiAsService<any>(LEADS_QUERY);
    return res.status(200).json({ success: true, leads: normalizeLeads(data) });
  } catch (error) {
    console.error("Leads list failed", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
