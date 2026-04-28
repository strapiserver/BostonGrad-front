import axios from "axios";
import { GraphQLClient } from "graphql-request";
import normalize from "./normalizer";
import {
  cmsLinkDEV,
  cmsLinkPROD,
  converterLinkDEV,
  converterLinkPROD,
  internalCmsLink,
  internalConverterLink,
  internalServerLink,
  mylog,
  resolveCmsUrl,
  resolveInternalUrl,
  serverLinkDEV,
  serverLinkPROD,
} from "./utils";

const serializeError = (error: any) => {
  const status = error?.response?.status ?? error?.status;
  const statusText =
    error?.response?.statusText ?? error?.response?.data?.error ?? undefined;
  const message = error?.message || String(error);
  const responseData = error?.response?.data;
  const responsePreview =
    typeof responseData === "string"
      ? responseData.slice(0, 300)
      : responseData && typeof responseData === "object"
        ? JSON.stringify(responseData).slice(0, 300)
        : undefined;

  return { status, statusText, message, responsePreview };
};

const retry = async <T>(fn: () => Promise<T>, retries = 3): Promise<T> => {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn(); // <-- added await
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
};
const unwrap = (data: any) => {
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

export const initCMSFetcher = () => {
  const env = process.env.NODE_ENV;
  const publicBase = env === "production" ? cmsLinkPROD : cmsLinkDEV;
  const baseUrl = resolveCmsUrl(publicBase, internalCmsLink);
  const url = baseUrl + "/graphql";

  const graphQLClient = new GraphQLClient(url || "", { timeout: 15000 });

  return async (query: string, variables?: Record<string, any>) => {
    try {
      const data = await retry(() => graphQLClient.request(query, variables));
      return unwrap(normalize(data));
    } catch (e) {
      console.error("CMS FETCHER ERROR after 3 retries:", {
        url,
        env,
        useInternal: process.env.USE_INTERNAL,
        base: process.env.NEXT_PUBLIC_BASE,
        error: serializeError(e),
      });
      return null;
    }
  };
};

export const initParserFetcher = () => {
  const env = process.env.NODE_ENV;
  const publicBase = env === "production" ? serverLinkPROD : serverLinkDEV;
  const url = resolveInternalUrl(publicBase, internalServerLink);

  return async (slug: string) => {
    const fullUrl = url + "/" + slug;
    try {
      const { data } = await retry(() => axios.get(fullUrl));
      return data;
    } catch (e) {
      console.error("PARSER FETCHER ERROR after 3 retries:", {
        url: fullUrl,
        env,
        useInternal: process.env.USE_INTERNAL,
        base: process.env.NEXT_PUBLIC_BASE,
        error: serializeError(e),
      });
      return null;
    }
  };
};

export const initCurrencyConverterFetcher = () => {
  const env = process.env.NODE_ENV;
  const publicBase =
    env === "production" ? converterLinkPROD : converterLinkDEV;
  const url = resolveInternalUrl(publicBase, internalConverterLink);

  return async (currenciesPair?: string) => {
    const fullUrl =
      url + "/" + (currenciesPair ? currenciesPair.toUpperCase() : "");
    try {
      const { data } = await retry(() => axios.get(fullUrl));
      return { data };
    } catch (e) {
      console.error("CONVERTER FETCHER ERROR after 3 retries:", {
        url: fullUrl,
        env,
        useInternal: process.env.USE_INTERNAL,
        base: process.env.NEXT_PUBLIC_BASE,
        error: serializeError(e),
      });
      return { data: null };
    }
  };
};
