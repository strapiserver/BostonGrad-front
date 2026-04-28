import { createHmac, timingSafeEqual } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

const COOKIE_NAME = "leads_session";
const TTL_SECONDS = 60 * 60 * 12;

type SessionPayload = {
  exp: number;
};

const getSecret = () => {
  const secret =
    process.env.LEADS_DASHBOARD_SESSION_SECRET ||
    process.env.LEADS_DASHBOARD_PASSWORD;
  if (!secret) {
    throw new Error(
      "Missing LEADS_DASHBOARD_SESSION_SECRET or LEADS_DASHBOARD_PASSWORD",
    );
  }
  return secret;
};

const base64UrlEncode = (input: string) =>
  Buffer.from(input, "utf8").toString("base64url");

const base64UrlDecode = (input: string) =>
  Buffer.from(input, "base64url").toString("utf8");

const sign = (payloadEncoded: string) =>
  createHmac("sha256", getSecret()).update(payloadEncoded).digest("base64url");

const parseCookies = (cookieHeader?: string) => {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (!k) continue;
    result[k] = decodeURIComponent(rest.join("="));
  }
  return result;
};

const serializeCookie = (name: string, value: string, maxAgeSec: number) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSec}${secure}`;
};

export const isLeadsPasswordValid = (password: string) => {
  const expected = process.env.LEADS_DASHBOARD_PASSWORD;
  return Boolean(expected && password === expected);
};

export const setLeadsSession = (res: NextApiResponse) => {
  const payload: SessionPayload = {
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  };
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  const token = `${payloadEncoded}.${signature}`;
  res.setHeader("Set-Cookie", serializeCookie(COOKIE_NAME, token, TTL_SECONDS));
};

export const clearLeadsSession = (res: NextApiResponse) => {
  res.setHeader("Set-Cookie", serializeCookie(COOKIE_NAME, "", 0));
};

export const hasValidLeadsSession = (req: NextApiRequest) => {
  const token = parseCookies(req.headers.cookie || "")[COOKIE_NAME];
  if (!token) return false;
  const [payloadEncoded, signature] = token.split(".");
  if (!payloadEncoded || !signature) return false;

  const expected = sign(payloadEncoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as SessionPayload;
    if (!payload?.exp) return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
};

