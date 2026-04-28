import type { NextApiRequest, NextApiResponse } from "next";
import { loadP2PTopParameters } from "../../../cache/loadX";
import { IP2PTopParameter, IP2PTopParameterType } from "../../../types/p2p";
import { TopParametersQuery } from "../../../services/queries";
import { initCMSFetcher } from "../../../services/fetchers";
import normalize from "../../../services/normalizer";
import { requestStrapiAsService } from "../../../services/server/strapiClient";

const isTopParameterType = (value: unknown): value is IP2PTopParameterType =>
  value === "p2p_maker" || value === "p2p_offer";

const unwrapGraphqlResult = (data: any) => {
  if (
    typeof data === "object" &&
    data !== null &&
    !Array.isArray(data) &&
    Object.keys(data).length === 1
  ) {
    return data[Object.keys(data)[0]];
  }
  return data;
};

const loadAllTopParameters = async (): Promise<IP2PTopParameter[]> => {
  const cmsFetcher = initCMSFetcher();

  try {
    const raw = await requestStrapiAsService<any>(TopParametersQuery);
    const normalized = unwrapGraphqlResult(normalize(raw));
    if (Array.isArray(normalized)) return normalized;
  } catch {}

  const fallback = await cmsFetcher(TopParametersQuery);
  if (Array.isArray(fallback)) return fallback;
  return [];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<IP2PTopParameter[] | { error: string }>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const rawType = Array.isArray(req.query.type) ? req.query.type[0] : req.query.type;
  const type = rawType?.trim();

  try {
    if (isTopParameterType(type)) {
      const data = await loadP2PTopParameters(type);
      return res.status(200).json(Array.isArray(data) ? data : []);
    }

    const data = await loadAllTopParameters();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "top_parameters_failed" });
  }
}
