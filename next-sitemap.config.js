const { Redis } = require("@upstash/redis");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

function createRedis() {
  const useRedis = String(process.env.USE_REDIS).toLowerCase() === "true";
  if (!useRedis) {
    console.warn("[sitemap] USE_REDIS is false. Skipping Redis.");
    return null;
  }
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.warn(
      "[sitemap] Upstash credentials missing. Falling back to static paths."
    );
    return null;
  }
  try {
    return new Redis({ url, token });
  } catch (error) {
    console.error("[sitemap] Failed to init Redis client:", error);
    return null;
  }
}

const redis = createRedis();
function resolveAllowCrawlers() {
  if (
    Object.prototype.hasOwnProperty.call(
      process.env,
      "NEXT_PUBLIC_ALLOW_CRAWLERS"
    )
  ) {
    return (
      String(process.env.NEXT_PUBLIC_ALLOW_CRAWLERS).toLowerCase() !== "false"
    );
  }
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return true;
  const parsed = dotenv.parse(fs.readFileSync(envPath));
  if (!Object.prototype.hasOwnProperty.call(parsed, "NEXT_PUBLIC_ALLOW_CRAWLERS")) {
    return true;
  }
  return String(parsed.NEXT_PUBLIC_ALLOW_CRAWLERS).toLowerCase() !== "false";
}

const allowCrawlers = resolveAllowCrawlers();

module.exports = {
  siteUrl: process.env.SITE_URL || "https://bostongrad.com",
  generateRobotsTxt: true,
  robotsTxtOptions: allowCrawlers
    ? {
        policies: [
          {
            userAgent: "Yandex",
            allow: "/",
            disallow: ["/cdn-cgi/"],
          },
          {
            userAgent: "*",
            allow: "/",
          },
        ],
        additionalSitemaps: ["https://bostongrad.com/sitemap.xml"],
        transformRobotsTxt: async () =>
          [
            "User-agent: Yandex",
            "Clean-param: utm_medium&utm_source&utm_campaign&ybaip&ctime",
            "Sitemap: https://bostongrad.com/sitemap.xml",
            "Disallow: /cdn-cgi/",
            "",
            "User-agent: *",
            "Sitemap: https://bostongrad.com/sitemap.xml",
            "",
          ].join("\n"),
      }
    : {
        policies: [
          {
            userAgent: "*",
            disallow: "/",
          },
        ],
        transformRobotsTxt: async () =>
          ["User-agent: *", "Disallow: /", ""].join("\n"),
      },
  exclude: ["/404"],
  // Collect extra paths from Redis
  additionalPaths: async () => {
    if (!redis) return [];
    try {
      const cached = await redis.get("sitemap:paths");
      const paths = cached?.data || [];

      return paths.map((p) => ({
        loc: p,
        lastmod: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("[sitemap] Failed to read cached paths:", error);
      return [];
    }
  },
};

// const { readCache } = require("./cache"); // Adjust the path as necessary

// const siteUrl = "https://p2pie.com";
// const locales = ["en", "ru"];

// const config = {
//   siteUrl,
//   generateRobotsTxt: true,
//   robotsTxtOptions: {
//     policies: [{ userAgent: "*", disallow: "/" }],
//   },
//   additionalPaths: async (config) => {
//     const cachedData = readCache();
//     let paths = [];
//     Object.keys(cachedData.slugToCodes).forEach((path) => {
//       locales.forEach((locale) => {
//         paths.push({
//           loc: `/${locale}${`/${path}`}`,
//           lastmod: new Date().toISOString(),
//         });
//       });
//     });

//     const enArticles = cachedData[`enData`]?.articles || [];
//     const ruArticles = cachedData[`ruData`]?.articles || [];

//     enArticles.forEach((article) => {
//       paths.push({
//         loc: `/en/${`${article.code.toLowerCase()}`}`,
//         lastmod: new Date().toISOString(),
//       });
//     });

//     ruArticles.forEach((article) => {
//       paths.push({
//         loc: `/ru/${`${article.code.toLowerCase()}`}`,
//         lastmod: new Date().toISOString(),
//       });
//     });

//     const exchangerSlugs = cachedData?.exchangerSlugs;

//     if (exchangerSlugs) {
//       exchangerSlugs.forEach((exchangerSlug) => {
//         paths.push({
//           loc: `/exchangers/${exchangerSlug}`,
//           lastmod: new Date().toISOString(),
//         });
//       });
//     }

//     console.log("paths for sitemap collected: ", paths.length);
//     return paths;
//   },
// };

// module.exports = config;
