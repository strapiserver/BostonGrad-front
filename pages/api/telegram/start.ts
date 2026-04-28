import type { NextApiRequest, NextApiResponse } from "next";
import { createHmac } from "crypto";

type StartResponse =
  | {
      ok: true;
      link: string;
      slug: string;
    }
  | {
      ok: false;
      error: string;
    };

const SIGNATURE_BYTES = 12;

const normalizeSlug = (value?: string | null) =>
  (value || "").trim().replace(/^@/, "").toLowerCase();

const isValidTelegramSlug = (slug: string) => /^[a-z0-9_]{3,64}$/i.test(slug);

const toBase64Url = (value: Buffer) =>
  value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const buildStartPayload = ({
  slug,
  secret,
}: {
  slug: string;
  secret: string;
}) => {
  const timestamp = Math.floor(Date.now() / 1000).toString().padStart(10, "0");
  const message = `${slug}.${timestamp}`;
  const signature = toBase64Url(
    createHmac("sha256", secret).update(message).digest().subarray(0, SIGNATURE_BYTES),
  );
  return `${slug}${timestamp}${signature}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StartResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const slugParam = req.query?.slug;
  const slug = normalizeSlug(Array.isArray(slugParam) ? slugParam[0] : slugParam);
  if (!slug || !isValidTelegramSlug(slug)) {
    return res.status(400).json({ ok: false, error: "invalid_slug" });
  }

  const botUsername =
    process.env.NEXT_PUBLIC_BOT_USERNAME || process.env.BOT_USERNAME;
  const botStartSecret =
    process.env.BOT_START_SECRET ||
    (process.env.NODE_ENV === "development"
      ? process.env.NEXT_PUBLIC_BOT_START_SECRET
      : undefined);

  if (!botUsername || !botStartSecret) {
    return res
      .status(500)
      .json({ ok: false, error: "bot_start_config_missing" });
  }

  const payload = buildStartPayload({ slug, secret: botStartSecret });
  const normalizedBot = botUsername.replace(/^@/, "");
  const link = `https://t.me/${normalizedBot}?start=${payload}`;

  return res.status(200).json({ ok: true, link, slug });
}
