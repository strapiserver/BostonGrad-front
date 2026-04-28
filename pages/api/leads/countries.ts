import type { NextApiRequest, NextApiResponse } from "next";
import { gql } from "graphql-request";
import { requestStrapiAsService } from "../../../services/server/strapiClient";
import { hasValidLeadsSession } from "../../../services/server/leadsSession";
import { CountryOption } from "../../../types/lead";

type ResponseBody = {
  success: boolean;
  countries?: CountryOption[];
  error?: string;
};

const COUNTRIES_QUERY = gql`
  query CountriesDashboard {
    countries(sort: "name:asc", pagination: { start: 0, limit: 500 }) {
      data {
        id
        attributes {
          name
        }
      }
    }
  }
`;

const normalizeCountries = (raw: any): CountryOption[] => {
  const rows = raw?.countries?.data || [];
  if (!Array.isArray(rows)) return [];

  return rows
    .map((item: any) => {
      const attrs = item?.attributes || {};
      const name = attrs?.name;
      if (typeof name !== "string" || !name.trim()) return null;
      return {
        id: String(item?.id || ""),
        name,
      };
    })
    .filter((item: CountryOption | null): item is CountryOption => Boolean(item));
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
    const data = await requestStrapiAsService<any>(COUNTRIES_QUERY);
    return res
      .status(200)
      .json({ success: true, countries: normalizeCountries(data) });
  } catch (error) {
    console.error("Leads countries failed", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}
