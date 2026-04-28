export type TelegramVerifyResponse = {
  ok?: boolean;
  slug?: string;
  telegramUsername?: string;
  expiresAt?: string | null;
  confirmToken?: string;
  error?: string;
};

const normalizeBaseUrl = (value?: string | null) => {
  if (!value) return "";
  return value.trim().replace(/\/+$/, "");
};

const getVerifyTokenUrl = () => {
  return normalizeBaseUrl(
    process.env.TELEGRAM_VERIFY_URL ||
      process.env.NEXT_PUBLIC_TELEGRAM_VERIFY_URL ||
      (process.env.NODE_ENV === "development" ? "http://localhost:3005/verify" : ""),
  );
};

const getVerifySlugUrl = () => {
  const explicit = normalizeBaseUrl(
    process.env.TELEGRAM_VERIFY_BY_SLUG_URL ||
      process.env.NEXT_PUBLIC_TELEGRAM_VERIFY_BY_SLUG_URL,
  );
  if (explicit) return explicit;

  const tokenUrl = getVerifyTokenUrl();
  if (!tokenUrl) return "";

  if (tokenUrl.endsWith("/verify")) {
    return `${tokenUrl.slice(0, -"/verify".length)}/verify-slug`;
  }
  return `${tokenUrl}/verify-slug`;
};

const getServerAuthHeader = () => {
  const secret = process.env.BOT_TO_FRONT_SECRET || process.env.BOT_TO_BACKEND_SECRET;
  if (!secret) return null;
  return `Bearer ${secret}`;
};

export const verifyTelegramTokenServer = async (
  token: string,
): Promise<TelegramVerifyResponse | null> => {
  const baseUrl = getVerifyTokenUrl();
  if (!baseUrl) return null;

  const url = `${baseUrl}?token=${encodeURIComponent(token)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return { ok: false, error: `verify_failed_${response.status}` };
    return (await response.json()) as TelegramVerifyResponse;
  } catch {
    return { ok: false, error: "verify_network_error" };
  }
};

export const verifyTelegramSlugServer = async (
  slug: string,
): Promise<TelegramVerifyResponse | null> => {
  const baseUrl = getVerifySlugUrl();
  const authHeader = getServerAuthHeader();
  if (!baseUrl || !authHeader) return null;

  const url = `${baseUrl}?slug=${encodeURIComponent(slug)}`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: authHeader,
      },
    });
    if (!response.ok) return { ok: false, error: `verify_slug_failed_${response.status}` };
    return (await response.json()) as TelegramVerifyResponse;
  } catch {
    return { ok: false, error: "verify_slug_network_error" };
  }
};
