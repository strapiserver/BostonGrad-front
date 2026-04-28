import { GraphQLClient } from "graphql-request";
import {
  cmsLinkDEV,
  cmsLinkPROD,
  internalCmsLink,
  resolveCmsUrl,
  resolveInternalUrl,
} from "../utils";

const LOGIN_MUTATION = `
  mutation Login($identifier: String!, $password: String!) {
    login(input: { identifier: $identifier, password: $password }) {
      jwt
    }
  }
`;
const TOKEN_REFRESH_SKEW_MS = 60_000;

type CachedToken = {
  jwt: string;
  expiresAtMs: number;
};

let cachedToken: CachedToken | null = null;

const getGraphqlUrl = () => {
  const env = process.env.NODE_ENV;
  const publicBase = env === "production" ? cmsLinkPROD : cmsLinkDEV;
  const baseUrl = resolveCmsUrl(publicBase, internalCmsLink);
  return `${baseUrl}/graphql`;
};

const createClient = (jwt?: string) =>
  new GraphQLClient(getGraphqlUrl(), {
    timeout: 15000,
    headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
  });

const decodeJwtExpMs = (jwt: string) => {
  try {
    const payloadRaw = jwt.split(".")[1];
    if (!payloadRaw) return Date.now() + 30 * 60 * 1000;

    const base64 = payloadRaw.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf8");
    const payload = JSON.parse(json) as { exp?: number };
    if (!payload.exp || !Number.isFinite(payload.exp)) {
      return Date.now() + 30 * 60 * 1000;
    }
    return payload.exp * 1000;
  } catch {
    return Date.now() + 30 * 60 * 1000;
  }
};

const authErrorLike = (error: unknown) => {
  const e = error as any;
  const status = e?.response?.status;
  if (status === 401 || status === 403) return true;

  const combinedMessage = [
    e?.message,
    ...(Array.isArray(e?.response?.errors)
      ? e.response.errors.map((item: any) => item?.message)
      : []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return /(unauthor|forbidden|jwt|token|permission)/.test(combinedMessage);
};

const loginToStrapi = async () => {
  const identifier = process.env.STRAPI_AUTH_IDENTIFIER;
  const password = process.env.STRAPI_AUTH_PASSWORD;

  if (!identifier || !password) {
    throw new Error(
      "Missing STRAPI_AUTH_IDENTIFIER or STRAPI_AUTH_PASSWORD environment variables.",
    );
  }

  const client = createClient();
  const result = (await client.request(LOGIN_MUTATION, {
    identifier,
    password,
  })) as { login?: { jwt?: string } };

  const jwt = result?.login?.jwt;
  if (!jwt) {
    throw new Error("Strapi login did not return a JWT.");
  }

  cachedToken = {
    jwt,
    expiresAtMs: decodeJwtExpMs(jwt),
  };

  return jwt;
};

const getStrapiJwt = async (forceRefresh = false) => {
  const now = Date.now();
  const tokenValid = Boolean(
    !forceRefresh &&
    cachedToken?.jwt &&
    cachedToken.expiresAtMs - TOKEN_REFRESH_SKEW_MS > now,
  );
  if (tokenValid) {
    return cachedToken!.jwt;
  }
  return await loginToStrapi();
};

export const requestStrapiAsService = async <T = any>(
  query: string,
  variables?: Record<string, any>,
) => {
  let jwt = await getStrapiJwt(false);
  let client = createClient(jwt);

  try {
    return (await client.request(query, variables)) as T;
  } catch (error) {
    if (!authErrorLike(error)) throw error;

    jwt = await getStrapiJwt(true);
    client = createClient(jwt);
    return (await client.request(query, variables)) as T;
  }
};
