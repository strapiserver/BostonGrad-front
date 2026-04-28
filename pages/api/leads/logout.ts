import type { NextApiRequest, NextApiResponse } from "next";
import { clearLeadsSession } from "../../../services/server/leadsSession";

type ResponseBody = { success: boolean };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false });
  }
  clearLeadsSession(res);
  return res.status(200).json({ success: true });
}

