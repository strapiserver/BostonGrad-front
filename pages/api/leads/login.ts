import type { NextApiRequest, NextApiResponse } from "next";
import { isLeadsPasswordValid, setLeadsSession } from "../../../services/server/leadsSession";

type ResponseBody = { success: boolean; error?: string };

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseBody>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  const password = String(req.body?.password || "");
  if (!isLeadsPasswordValid(password)) {
    return res.status(401).json({ success: false, error: "Invalid password" });
  }

  setLeadsSession(res);
  return res.status(200).json({ success: true });
}

