import { env } from "process";
import { getArray, getItem, setArray } from "./redis";
import { redisGet, redisSet } from "./redisClient";

export async function cachedFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  let cached: { data: T; updatedAt: number } | null = null;

  cached = await redisGet<{ data: T; updatedAt: number }>(key);

  if (cached && env.NODE_ENV !== "development") {
    const isStale =
      ttlSeconds > 0 && Date.now() - cached.updatedAt > ttlSeconds * 1000;

    if (isStale) {
      // Refresh in background
      fetcher()
        .then((data) => {
          if (data !== null && data !== undefined) {
            return redisSet(key, { data, updatedAt: Date.now() });
          }
        })
        .catch((err) =>
          console.error(`SWR refresh failed for key "${key}":`, err)
        );
    }

    return cached.data;
  }

  // No cache → fetch synchronously
  const data = await fetcher();

  if (data !== null && data !== undefined) {
    void redisSet(key, { data, updatedAt: Date.now() });
  }

  return data;
}

/**
 * Add one or more paths to the sitemap:paths key in Redis
 */
type StaticPath = {
  params: { [key: string]: string };
  locale?: string;
};

type AddPathsOptions = {
  basePath?: string;
  includeLocale?: boolean;
};

function buildPath(p: StaticPath, options?: AddPathsOptions) {
  const basePath = options?.basePath
    ? `/${options.basePath}`.replace(/\/+/g, "/").replace(/\/$/, "")
    : "";
  const locale =
    options?.includeLocale && p.locale
      ? `/${encodeURIComponent(p.locale)}`
      : "";
  const segments = Object.values(p.params)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const path = `${locale}${basePath}/${segments}`.replace(/\/+/g, "/");
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
}

export async function addPathsToSitemap(
  paths: StaticPath | StaticPath[],
  options?: AddPathsOptions
) {
  const key = "sitemap:paths";
  const normalized = Array.isArray(paths) ? paths : [paths];

  // Convert objects to URL paths
  const stringPaths = normalized.map((p) => buildPath(p, options));
  // Remove legacy entries that were stored without a basePath
  const legacyPaths =
    options?.basePath && options.basePath.length
      ? normalized.map((p) => buildPath(p))
      : [];

  try {
    const cached = await redisGet<{ data: string[]; updatedAt: number }>(key);
    const existing =
      (cached?.data || []).filter((p) => !legacyPaths.includes(p));

    // Merge and deduplicate
    const merged = Array.from(new Set([...existing, ...stringPaths]));

    await redisSet(key, { data: merged, updatedAt: Date.now() });
    console.log(
      `Added ${stringPaths.length} path(s) to sitemap. Total now: ${merged.length}`
    );
  } catch (err) {
    console.error(`Failed to add paths to sitemap:`, err);
  }
}
export async function addHeadersToSearchIndex(
  entries:
    | { slug: string; header?: string; wordsToSearchFrom?: string }
    | { slug: string; header?: string; wordsToSearchFrom?: string }[]
) {
  const key = "search:index";
  const locale = "ru";
  const normalizedEntries = Array.isArray(entries) ? entries : [entries];

  try {
    const cached = await redisGet<{ data: any[]; updatedAt: number }>(key);
    const existing = cached?.data || [];

    // Map existing entries by locale/slug for fast deduplication
    const mergedMap = new Map(
      existing.map((e) => [`${e.locale || ""}/${e.slug}`, e])
    );

    for (const entry of normalizedEntries) {
      const newKey = `${locale}/${entry.slug}`;
      const cleanedWords = cleanWords(
        entry.wordsToSearchFrom || entry.header || ""
      );

      const newValue = {
        ...entry,
        locale,
        wordsToSearchFrom: cleanedWords,
      };

      // Skip duplicates (same normalized cleaned words)
      const alreadyExists = Array.from(mergedMap.values()).some(
        (e) =>
          normalizeText(e.wordsToSearchFrom) === normalizeText(cleanedWords)
      );

      if (!alreadyExists) {
        mergedMap.set(newKey, newValue);
      }
    }

    const merged = Array.from(mergedMap.values());

    await redisSet(key, { data: merged, updatedAt: Date.now() });
  } catch (err) {
    console.error(`❌ Failed to add headers to search index:`, err);
  }
}

function normalizeText(str: string): string {
  return str
    ?.toLowerCase()
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function cleanWords(str: string): string {
  if (!str) return "";

  // remove "undefined" or "null" and extra spaces
  const cleaned = str
    .replace(/\b(undefined|null)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // split into words, remove duplicates (case-insensitive)
  const uniqueWords = Array.from(
    new Set(cleaned.split(/\s+/).map((w) => w.toLowerCase()))
  );

  return uniqueWords.join(" ");
}

//...
export async function cachedArrayFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T[]>,
  toKey: (item: T) => string
): Promise<T[]> {
  let cachedSlugs: string[] = [];

  try {
    cachedSlugs = ((await getArray(key)) || []) as any;
  } catch (err) {
    console.error(`Redis GET (array) failed for "${key}":`, err);
  }

  if (cachedSlugs.length && process.env.NODE_ENV !== "development") {
    const metaRaw = (await redisGet<string>(`${key}:__meta`)) ?? null;
    let updatedAt = 0;

    if (metaRaw) {
      try {
        updatedAt = JSON.parse(metaRaw).updatedAt ?? 0;
      } catch {
        updatedAt = 0;
      }
    }

    const isStale =
      ttlSeconds > 0 && Date.now() - updatedAt > ttlSeconds * 1000;

    if (isStale) {
      fetcher()
        .then(async (data) => {
          await setArray(key, data, toKey, ttlSeconds);
          await redisSet(
            `${key}:__meta`,
            JSON.stringify({ updatedAt: Date.now() })
          );
        })
        .catch((err) =>
          console.error(`SWR refresh (array) failed for "${key}":`, err)
        );
    }

    // Return hydrated objects instead of just slugs
    return Promise.all(cachedSlugs.map((slug) => getItem<T>(key, slug))).then(
      (items) => items.filter(Boolean) as T[]
    );
  }

  const data = await fetcher();

  if (data.length > 0) {
    await setArray(key, data, toKey, ttlSeconds);
    await redisSet(`${key}:__meta`, JSON.stringify({ updatedAt: Date.now() }));
  }

  return data;
}
