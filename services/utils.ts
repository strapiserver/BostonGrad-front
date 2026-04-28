const isServerSide = typeof window === "undefined";

const normalizeEnvValue = (value?: string) => {
  if (typeof value !== "string") return value;
  return value.trim().replace(/^['"]|['"]$/g, "");
};

const useInternal =
  normalizeEnvValue(process.env.USE_INTERNAL)?.toLowerCase() === "true";
const isDev =
  normalizeEnvValue(process.env.IS_DEV)?.toLowerCase() === "true";
const publicCmsUrl = normalizeEnvValue(process.env.NEXT_PUBLIC_CMS_URL);

export const base = normalizeEnvValue(process.env.NEXT_PUBLIC_BASE);
const normalizedIndex = normalizeEnvValue(process.env.NEXT_PUBLIC_INDEX);
export const index = !normalizedIndex || normalizedIndex == "0" ? "" : normalizedIndex;

export const converterLinkPROD = `https://converter${index}.${base}`;
export const serverLinkPROD = `https://server${index}.${base}`;
export const cmsLinkPROD = `https://cms${index}.${base}`;

const devCmsFallback = "http://localhost:1337";
const devServerFallback = "http://localhost:5000";
const devConverterFallback = "http://localhost:5001";

export const converterLinkDEV =
  normalizeEnvValue(process.env.NEXT_PUBLIC_CONVERTER_URL) ||
  (base ? `https://converter${index}.${base}` : devConverterFallback);
export const serverLinkDEV =
  normalizeEnvValue(process.env.NEXT_PUBLIC_SERVER_URL) ||
  (base ? `https://server${index}.${base}` : devServerFallback);
export const cmsLinkDEV =
  normalizeEnvValue(process.env.NEXT_PUBLIC_CMS_URL) ||
  (base ? `https://cms${index}.${base}` : devCmsFallback);

export const internalConverterLink = normalizeEnvValue(
  process.env.INTERNAL_CONVERTER_URL,
);
export const internalServerLink = normalizeEnvValue(
  process.env.INTERNAL_SERVER_URL,
);
export const internalCmsLink = normalizeEnvValue(process.env.INTERNAL_CMS_URL);

export const minRatesMap = +(process.env.NEXT_PUBLIC_MIN_RATES_MAP || 2);

export const resolveInternalUrl = (external: string, internal?: string) =>
  isServerSide && useInternal && internal ? internal : external;

export const resolveCmsUrl = (external: string, internal?: string) =>
  isServerSide && useInternal && internal
    ? internal
    : publicCmsUrl || external;

export const locale = "ru" as "ru" | "en";

//"http://127.0.0.1:5000"

export const mylog = (
  message: any,
  color:
    | "error"
    | "success"
    | "warning"
    | "important"
    | "info"
    | "hidden" = "info",
) => {
  const colors = {
    error: "📕 \u001b[1;31m",
    success: "📗 \u001b[1;32m",
    warning: "📙 \u001b[1;33m",
    info: "📘 \u001b[1;34m",
    hidden: "📓 \u001b[1;30m",
    important: "📔 \u001b[38;5;226m",
  };
  console.log(`${colors[color]} ${message}`);
};
