export type TelegramConfirmRecord = {
  ok: boolean;
  status: string;
  slug: string;
  telegramUserId?: string | number | null;
  telegramUsername?: string | null;
  confirmToken: string;
  expiresAt?: string | null;
  receivedAt: string;
};

const STORAGE_PREFIX = "p2p:telegram:confirm:";
// Telegram confirmation state is intentionally process-local only.
// No Redis dependency in this flow.
const memoryStore = new Map<string, { value: TelegramConfirmRecord; exp: number }>();

const getKey = (slug: string) => `${STORAGE_PREFIX}${slug.toLowerCase()}`;

const getTtlSeconds = (expiresAt?: string | null) => {
  if (!expiresAt) return 3600;
  const expMs = Date.parse(expiresAt);
  if (Number.isNaN(expMs)) return 3600;
  const diffMs = expMs - Date.now();
  return Math.max(60, Math.floor(diffMs / 1000));
};

export const setTelegramConfirmation = async (
  record: TelegramConfirmRecord
) => {
  const key = getKey(record.slug);
  const ttlSeconds = getTtlSeconds(record.expiresAt);

  memoryStore.set(key, {
    value: record,
    exp: Date.now() + ttlSeconds * 1000,
  });
};

export const getTelegramConfirmation = async (slug: string) => {
  const key = getKey(slug);
  const local = memoryStore.get(key);
  if (!local) return null;
  if (local.exp <= Date.now()) {
    memoryStore.delete(key);
    return null;
  }
  return local.value;
};

export const clearTelegramConfirmation = async (slug: string) => {
  const key = getKey(slug);
  memoryStore.delete(key);
};
