import { initCMSFetcher, initParserFetcher } from "../services/fetchers";
import {
  TextBoxQuery,
  MainTextsQuery,
  dirsTextQuery,
  articleCodesQuery,
  // blogQuery,
  articleQuery,
  selectorQuery,
  exchangerQuery,
  exchangersQuery,
  citiesQuery,
  massDirTextIdsQuery,
  massDirTextQuery,
  blogQuery,
  FAQbyCategoryCodeQuery,
  FAQsQuery,
  allReviewsQuery,
  unisQuery,
  legacyCardsQuery,
  mainSingleQuery,
  allBenefitQuery,
  storiesQuery,
} from "../services/queries";
import { getPmsFromSelector } from "./helper";
import { cachedFetch } from "./cache";
import { ICity, IDirText } from "../types/exchange";
import {
  exchangerNameToSlug,
  exchangerSlugToName,
} from "../components/exchangers/helper";
import {
  IAllBenefit,
  IArticle,
  IMainSingle,
  IStory,
  IUni,
} from "../types/pages";
import { IExchanger, IExchangerPreview } from "../types/exchanger";
import { IMassDirTextId, IMassDirText, IMassRate } from "../types/mass";
import { IFaqCategory } from "../types/faq";
import { IExchangerReview } from "../types/exchanger";
import {
  p2pMakerQuery,
  p2pMakersQuery,
  p2pMakerTopParametersQuery,
  p2pOfferTopParametersQuery,
  testReviewQuery,
  p2pLevelsQuery,
  p2pAdsQuery,
} from "../services/p2p";
import {
  IMaker,
  IMakerPreview,
  IP2PAd,
  IP2PLevel,
  IP2PTopParameter,
  IP2PTopParameterType,
} from "../types/p2p";
import { requestStrapiAsService } from "../services/server/strapiClient";
import normalize from "../services/normalizer";
//import { p2pMakerQuery } from "../pages/p2p/queries";

const locale = "ru";
const legacyMonitoringEnabled =
  process.env.NEXT_PUBLIC_ENABLE_LEGACY_MONITORING_PAGES === "true";

const cmsFetcher = initCMSFetcher();
const parserFetcher = initParserFetcher();
const diagEnabled =
  process.env.DEBUG_EXCHANGER_MAP === "true" ||
  process.env.DEBUG_EXCHANGER_MAP === "1";

const diagLog = (scope: string, payload: Record<string, any>) => {
  if (!diagEnabled) return;
  console.log(`[diag:${scope}]`, payload);
};

const queryLabel = (query: string) => {
  const normalized = String(query || "").replace(/\s+/g, " ").trim();
  const namedMatch = normalized.match(/\b(query|mutation)\s+([A-Za-z0-9_]+)/);
  if (namedMatch?.[2]) return namedMatch[2];
  if (normalized.includes("parserSetting")) return "citiesQuery";
  if (normalized.includes("exchangers(") && normalized.includes("offices"))
    return "exchangersQuery";
  if (normalized.includes("exchangers(")) return "exchangerQuery";
  return normalized.slice(0, 60);
};

const summarizeResult = (value: any) => {
  if (Array.isArray(value)) return { kind: "array", length: value.length };
  if (value && typeof value === "object") {
    return {
      kind: "object",
      keys: Object.keys(value).slice(0, 12),
    };
  }
  return { kind: typeof value, value };
};

const unwrapGraphqlResult = (data: any) => {
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

const fetchCMSWithServiceFallback = async (
  query: string,
  variables?: Record<string, any>,
) => {
  const label = queryLabel(query);
  try {
    const raw = await requestStrapiAsService<any>(query, variables);
    const result = unwrapGraphqlResult(normalize(raw));
    diagLog("cms.service", {
      query: label,
      via: "service-auth",
      variablesKeys: Object.keys(variables || {}),
      result: summarizeResult(result),
    });
    return result;
  } catch (error) {
    console.warn("[diag:cms.service] primary failed, falling back to cmsFetcher", {
      query: label,
      message: (error as any)?.message || String(error),
      variablesKeys: Object.keys(variables || {}),
    });
    const fallback = await cmsFetcher(query, variables);
    diagLog("cms.fallback", {
      query: label,
      via: "public/internal-cmsFetcher",
      variablesKeys: Object.keys(variables || {}),
      result: summarizeResult(fallback),
    });
    return fallback;
  }
};

export const TTL = {
  instant: 60 * 2,
  fast: 60 * 10,
  slow: 60 * 60,
  slowest: 60, // временно делаем быстрым
  never: -1,
};

export const loadRootText = () =>
  cachedFetch(`root_text_${locale}`, TTL.slow, async () => {
    const res = (await cmsFetcher(TextBoxQuery, {
      locale,
      key: "root",
    })) as IDirText[];
    return res?.[0] || null;
  });

export const loadMainTexts = () =>
  cachedFetch(`main_texts_${locale}`, TTL.slow, () =>
    cmsFetcher(MainTextsQuery, { locale }),
  );

export const loadUnis = () =>
  cachedFetch(`unis_${locale}`, TTL.slow, async () => {
    const normalizeUnis = (input: IUni[] | null | undefined) =>
      (input || []).filter((uni) =>
        Boolean(
          uni?.id &&
            (uni?.header ||
              uni?.article?.header ||
              uni?.image ||
              uni?.article?.code ||
              uni?.slug),
        ),
      );

    const primary = (await cmsFetcher(unisQuery)) as IUni[] | null;
    const normalizedPrimary = normalizeUnis(primary);
    if (normalizedPrimary.length > 0) return normalizedPrimary;

    const serviceFallback =
      (await fetchCMSWithServiceFallback(unisQuery)) as IUni[] | null;
    const normalizedServiceFallback = normalizeUnis(serviceFallback);
    if (normalizedServiceFallback.length > 0) return normalizedServiceFallback;

    const legacyCards = (await cmsFetcher(legacyCardsQuery)) as IUni[] | null;
    const normalizedLegacyCards = normalizeUnis(legacyCards);
    if (normalizedLegacyCards.length > 0) return normalizedLegacyCards;

    const legacyServiceFallback =
      (await fetchCMSWithServiceFallback(legacyCardsQuery)) as IUni[] | null;
    const normalizedLegacyServiceFallback = normalizeUnis(legacyServiceFallback);
    if (normalizedLegacyServiceFallback.length > 0)
      return normalizedLegacyServiceFallback;

    return [];
  });

export const loadMainSingle = () =>
  cachedFetch(`main_single_${locale}`, TTL.slow, async () => {
    const localized = (await cmsFetcher(mainSingleQuery, {
      locale,
    })) as IMainSingle[] | null;
    if (localized?.[0]?.id) return localized[0];

    const fallback = (await cmsFetcher(mainSingleQuery)) as IMainSingle[] | null;
    if (fallback?.[0]?.id) return fallback[0];

    const serviceLocalized = (await fetchCMSWithServiceFallback(mainSingleQuery, {
      locale,
    })) as IMainSingle[] | null;
    if (serviceLocalized?.[0]?.id) return serviceLocalized[0];

    const serviceFallback =
      (await fetchCMSWithServiceFallback(mainSingleQuery)) as IMainSingle[] | null;
    if (serviceFallback?.[0]?.id) return serviceFallback[0];

    return null;
  });

export const loadAllBenefit = () =>
  cachedFetch(`all_benefit_${locale}`, TTL.slow, async () => {
    const normalizeAllBenefit = (
      input: IAllBenefit | null | undefined,
    ): IAllBenefit | null => {
      if (!input?.id) return null;
      const benefits = (input.benefits || [])
        .filter((item) => item?.id && item?.title)
        .sort((a, b) => {
          const aRank =
            typeof a.rank === "number" ? a.rank : Number.MAX_SAFE_INTEGER;
          const bRank =
            typeof b.rank === "number" ? b.rank : Number.MAX_SAFE_INTEGER;
          if (aRank !== bRank) return aRank - bRank;
          return String(a.title).localeCompare(String(b.title), "ru");
        });

      return { ...input, benefits };
    };

    const localized = normalizeAllBenefit(
      (await cmsFetcher(allBenefitQuery, { locale })) as IAllBenefit | null,
    );
    if (localized?.benefits?.length) return localized;

    const fallback = normalizeAllBenefit(
      (await cmsFetcher(allBenefitQuery)) as IAllBenefit | null,
    );
    if (fallback?.benefits?.length) return fallback;

    const serviceLocalized = normalizeAllBenefit(
      (await fetchCMSWithServiceFallback(allBenefitQuery, {
        locale,
      })) as IAllBenefit | null,
    );
    if (serviceLocalized?.benefits?.length) return serviceLocalized;

    const serviceFallback = normalizeAllBenefit(
      (await fetchCMSWithServiceFallback(allBenefitQuery)) as IAllBenefit | null,
    );
    if (serviceFallback?.benefits?.length) return serviceFallback;

    return null;
  });

export const loadStories = () =>
  cachedFetch(`stories_${locale}`, TTL.slow, async () => {
    const normalizeStories = (input: IStory[] | null | undefined) =>
      (input || []).filter((story) => !!story?.id && !!story?.name);

    const localized = (await cmsFetcher(storiesQuery, { locale })) as IStory[] | null;
    const normalizedLocalized = normalizeStories(localized);
    if (normalizedLocalized.length > 0) return normalizedLocalized;

    const fallback = (await cmsFetcher(storiesQuery)) as IStory[] | null;
    const normalizedFallback = normalizeStories(fallback);
    if (normalizedFallback.length > 0) return normalizedFallback;

    const serviceLocalized = (await fetchCMSWithServiceFallback(storiesQuery, {
      locale,
    })) as IStory[] | null;
    const normalizedServiceLocalized = normalizeStories(serviceLocalized);
    if (normalizedServiceLocalized.length > 0) return normalizedServiceLocalized;

    const serviceFallback =
      (await fetchCMSWithServiceFallback(storiesQuery)) as IStory[] | null;
    const normalizedServiceFallback = normalizeStories(serviceFallback);
    if (normalizedServiceFallback.length > 0) return normalizedServiceFallback;

    return [];
  });

export const loadParserExchangers = () =>
  cachedFetch("exchangers", TTL.fast, () => parserFetcher("exchangers"));

export const loadArticleCodes = () =>
  cachedFetch("articleCodes", TTL.slow, async () => {
    const res = await cmsFetcher(articleCodesQuery);
    if (!Array.isArray(res)) return [];
    return res.map((a: any) => a.code) as string[];
  });

// export const loadBlog = async (locale: "en" | "ru") =>
//   cachedFetch(`articles_${locale}`, TTL.slow, async () => {
//     const articles = (await cmsFetcher(blogQuery, { locale }))
//       ?.articles as IArticle[];

//     await Promise.all(
//       // вызываем в getStaticPaths чтобы потом подхватить кэш из getStaticProps
//       articles.map((a) =>
//         redis.set(
//           `article_${a.code.toLowerCase()}_${locale}`,
//           { data: a, updatedAt: Date.now() } // SWR format
//         )
//       )
//     );

//     return articles;
//   });

export const loadArticle = (code: string) =>
  cachedFetch(`article_${code.toLowerCase()}_${locale}`, TTL.slow, async () => {
    const res = await cmsFetcher(articleQuery, { code, locale });
    return (res?.[0] || null) as IArticle | null;
  });

export const loadPossibleDirs = () =>
  cachedFetch("dirs", TTL.fast, async () => {
    if (!legacyMonitoringEnabled) return {};
    const dirs = (await parserFetcher("dirs")) as
      | Record<string, number>
      | null; // {"BTC_USDTTRC20": 119, "BTC_ETH": 34, ...}

    return dirs || {};
  });

export const limitedPossibleDirs = (
  dirs: Record<string, number> | null | undefined,
  strength: "low" | "middle" | "high",
): string[] => {
  if (!dirs || typeof dirs !== "object") return [];
  const limit =
    strength == "low"
      ? 2
      : strength == "middle"
        ? process.env.NEXT_PUBLIC_RATES_MIN || 5
        : process.env.NEXT_PUBLIC_RATES_RENDER_MIN || 10;
  return Object.entries(dirs)
    .filter(([dir, rates]) => rates >= +limit)
    .map((v) => v[0]);
};

export const loadPms = async () => {
  if (!legacyMonitoringEnabled) return [];
  const pms = await cachedFetch("pms", TTL.slow, async () => {
    try {
      const selector = await cmsFetcher(selectorQuery);
      if (!selector) {
        console.error(
          "Selector is undefined - check selectorQueryAll and CMS response",
        );
        return []; // safe fallback
      }

      return getPmsFromSelector(selector);
    } catch (e) {
      console.log("error loading pms: ", e);
      return [];
    }
  });
  return pms;
};

export const loadExchanger = (slug: string) =>
  cachedFetch(`exchanger_${slug}`, TTL.fast, async () => {
    const name = exchangerSlugToName(slug);
    diagLog("loadExchanger.start", { slug, name });
    const res = await fetchCMSWithServiceFallback(exchangerQuery, { name });
    const exchanger = (res?.[0] as IExchanger) || null;
    if (!exchanger) {
      console.warn("[diag:loadExchanger.miss]", { slug, name, result: summarizeResult(res) });
    } else {
      diagLog("loadExchanger.hit", {
        slug,
        name,
        exchangerName: exchanger.name,
        displayName: exchanger.display_name,
        status: exchanger.status,
      });
    }
    return exchanger;
  });

export const loadExchangers = async () => {
  const [cmsExchangers] = (await Promise.all([
    cachedFetch("cms_exchangers", TTL.fast, () =>
      fetchCMSWithServiceFallback(exchangersQuery),
    ),
  ])) as IExchangerPreview[][];
  if (!Array.isArray(cmsExchangers)) {
    console.warn("[diag:loadExchangers.bad-shape]", {
      result: summarizeResult(cmsExchangers),
    });
  } else {
    diagLog("loadExchangers.ok", {
      count: cmsExchangers.length,
      first: cmsExchangers.slice(0, 5).map((e) => e?.name),
    });
  }
  return cmsExchangers;
};

export const loadBlog = async () => {
  const articles = await cachedFetch("articles", TTL.fast, () =>
    cmsFetcher(blogQuery),
  );
  return articles;
};

//const merged = mergeExchangers(cmsExchangers, parserExchangers);

// Promise.all(
//   // вызываем в getStaticPaths чтобы потом подхватить кэш из getStaticProps
//   cmsExchangers.map((ex) => {
//     const slug = exchangerNameToSlug(ex.name);
//     return redis.set(`exchanger_${slug}`, {
//       data: ex,
//       updatedAt: Date.now(),
//     });
//   })
// );

export const loadCities = () =>
  cachedFetch("cities", TTL.slow, async () => {
    if (!legacyMonitoringEnabled) return [];
    const res = await fetchCMSWithServiceFallback(citiesQuery);

    const cities = (Array.isArray(res) ? res : res?.cities || []) as ICity[];
    if (!Array.isArray(cities) || !cities.length) {
      console.warn("[diag:loadCities.empty]", {
        result: summarizeResult(res),
      });
    } else {
      diagLog("loadCities.ok", {
        count: cities.length,
        sample: cities.slice(0, 5).map((c) => c?.en_name),
      });
    }

    return cities;
  });

export const loadPopular = () =>
  cachedFetch("popular", TTL.instant, async () => {
    const res = await parserFetcher("top");
    return res || [];
  });

export const loadCustomDirText = (slug: string) =>
  cachedFetch(`custom_dir_text_${slug}`, TTL.instant, async () => {
    const res = await cmsFetcher(TextBoxQuery, { locale, key: slug });
    return res?.[0] as IDirText;
  });

export const loadFAQs = () =>
  cachedFetch(`faqs_${locale}`, TTL.slow, async () => {
    const res = (await cmsFetcher(FAQsQuery)) as IFaqCategory[] | null;
    return res || [];
  });

export const loadFAQbyCategoryCode = (code: string) =>
  cachedFetch(`faq_${code.toLowerCase()}_${locale}`, TTL.slow, async () => {
    const res = (await cmsFetcher(FAQbyCategoryCodeQuery, {
      code,
    })) as IFaqCategory[] | null;
    return res?.[0] || null;
  });

export const loadAllReviews = () =>
  cachedFetch(`all_reviews_${locale}`, TTL.fast, async () => {
    const res = (await cmsFetcher(allReviewsQuery, {
      locale,
    })) as unknown;

    if (!res) return [];
    if (Array.isArray(res)) return res as IExchangerReview[];
    if (Array.isArray((res as any).reviews))
      return (res as any).reviews as IExchangerReview[];
    if (Array.isArray((res as any)?.reviews?.data)) {
      return (res as any).reviews.data.map((item: any) => ({
        id: item?.id?.toString?.() ?? "",
        ...item?.attributes,
      }));
    }
    return [];
  });

// export const loadDirsTexts = (locale: "en" | "ru") =>
//   cachedFetch(
//     `dirsTexts_${locale}`,
//     TTL.slow,
//     () => cmsFetcher(dirsTextQuery, { locale }) as Promise<IDirText[]>
//   );
export const preloadDirTexts = () => {};

export const loadDirText = (sectionGive: string, sectionGet: string) =>
  cachedFetch(`dirText_${locale}_${sectionGive}_${sectionGet}`, TTL.slow, () =>
    cmsFetcher(dirsTextQuery, { locale }),
  ).then((r) => r[0]) as Promise<IDirText>;

export const loadMassDirTextIds = ({ isSell }: { isSell: boolean }) =>
  cachedFetch(
    `massDirTexts_${locale}_${isSell ? "sell" : "buy"}`,
    TTL.slow,
    async () => {
      if (!legacyMonitoringEnabled) return [];
      const massDirTextIds = (await cmsFetcher(massDirTextIdsQuery, {
        isSell,
      })) as IMassDirTextId[];
      return massDirTextIds || [];
    },
  );

export const loadMassDirText = ({
  massDirTextId,
  isSell,
}: {
  massDirTextId: IMassDirTextId;
  isSell: boolean;
}) =>
  cachedFetch(
    `${locale}_${isSell ? "sell" : "buy"}_${massDirTextId.code}_${
      massDirTextId.currency.code
    }`,
    TTL.slow,
    async () => {
      const result = (await cmsFetcher(massDirTextQuery, {
        locale,
        ...massDirTextId,
        currencyCode: massDirTextId.currency.code,
      })) as IMassDirText[] | null;
      const massDirText = (result?.[0] as IMassDirText) || null;
      return massDirText;
    },
  );

export const loadMassRates = ({
  currencyCode,
  code,
  isSell,
}: {
  currencyCode: string;
  code: string;
  isSell: boolean;
}) =>
  parserFetcher(
    `crypto=${code.toLowerCase()}/${currencyCode.toLowerCase()}/${
      isSell ? "give" : "get"
    }`,
  ) as Promise<IMassRate[]>;

export const loadP2PMaker = (telegramUsername: string) =>
  cachedFetch(`p2p_maker_v2_${telegramUsername}`, TTL.fast, async () => {
    if (!telegramUsername) return null;
    const res = await fetchCMSWithServiceFallback(p2pMakerQuery, {
      telegramUsername,
    });
    if (Array.isArray(res)) return (res[0] as IMaker) || null;
    return (res as IMaker) || null;
  });

export const loadAllP2PMakers = () =>
  cachedFetch(`p2p_makers_v2`, TTL.fast, async () => {
    const res = await fetchCMSWithServiceFallback(p2pMakersQuery);
    if (!res) return null;
    if (Array.isArray(res)) return res as IMakerPreview[];
    return [res as IMakerPreview];
  });

export const loadTestReview = () =>
  cachedFetch(`test_review`, TTL.fast, async () => {
    const res = await cmsFetcher(testReviewQuery);
    if (!res) return [];
    if (Array.isArray(res)) return res as IExchangerReview[];
    if (Array.isArray((res as any).reviews))
      return (res as any).reviews as IExchangerReview[];
    if (Array.isArray((res as any)?.reviews?.data)) {
      return (res as any).reviews.data.map((item: any) => ({
        id: item?.id?.toString?.() ?? "",
        ...item?.attributes,
      }));
    }
    return [];
  });

export const loadP2PLevels = () =>
  cachedFetch(`p2p_levels`, TTL.slow, async () => {
    const res = await cmsFetcher(p2pLevelsQuery);
    if (!res) return [];
    if (Array.isArray(res)) return res as IP2PLevel[];
    return [res as IP2PLevel];
  }) as Promise<IP2PLevel[]>;

export const loadP2PAds = () =>
  cachedFetch(`p2p_ads`, TTL.slow, async () => {
    const res = await cmsFetcher(p2pAdsQuery);
    if (!res) return [];
    if (Array.isArray(res)) return res as IP2PAd[];
    return [res as IP2PAd];
  }) as Promise<IP2PAd[]>;

export const loadP2PTopParameters = (type: IP2PTopParameterType) =>
  cachedFetch(`p2p_top_parameters_${type}`, TTL.slow, async () => {
    const query =
      type === "p2p_maker" ? p2pMakerTopParametersQuery : p2pOfferTopParametersQuery;
    const res = await fetchCMSWithServiceFallback(query);
    if (!res) return [];
    if (Array.isArray(res)) return res as IP2PTopParameter[];
    return [res as IP2PTopParameter];
  }) as Promise<IP2PTopParameter[]>;
