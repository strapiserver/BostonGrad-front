export type TelegramVerifyResponse = {
  ok: boolean;
  slug?: string;
  telegramUsername?: string;
  error?: string;
};

type TelegramConfirmation = {
  slug: string;
  token: string;
  telegramUsername?: string;
  confirmedAt: number;
};

const STORAGE_PREFIX = "p2p_telegram_confirm:";

export const normalizeTelegramSlug = (slug?: string | null) =>
  (slug || "").trim().replace(/^@/, "");

const getStorageKey = (slug: string) => `${STORAGE_PREFIX}${slug}`;

export const storeTelegramConfirmation = (data: TelegramConfirmation) => {
  if (typeof window === "undefined") return;
  const key = getStorageKey(normalizeTelegramSlug(data.slug));
  localStorage.setItem(key, JSON.stringify(data));
};

export const readTelegramConfirmation = (slug: string) => {
  if (typeof window === "undefined") return null;
  const key = getStorageKey(normalizeTelegramSlug(slug));
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TelegramConfirmation;
  } catch (error) {
    localStorage.removeItem(key);
    return null;
  }
};

export const clearTelegramConfirmation = (slug: string) => {
  if (typeof window === "undefined") return;
  const key = getStorageKey(normalizeTelegramSlug(slug));
  localStorage.removeItem(key);
};

export const verifyTelegramToken = async (
  token: string,
): Promise<TelegramVerifyResponse> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_TELEGRAM_VERIFY_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3005/verify"
      : "/auth/telegram/verify");
  const url = `${baseUrl}?token=${encodeURIComponent(token)}`;
  const response = await fetch(url);
  if (!response.ok) {
    return {
      ok: false,
      error: `verify_failed_${response.status}`,
    };
  }
  return (await response.json()) as TelegramVerifyResponse;
};
