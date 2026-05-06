import MainPageContent from "../components/main";
import {
  IMainSingle,
  IProduct,
  IStory,
  IUni,
  IVisa,
} from "../types/pages";
import UniversalSeo, { nullSeo } from "../components/shared/UniversalSeo";
import { ISEO } from "../types/general";
import { Box } from "@chakra-ui/react";
import gridPattern from "../public/grid.png";
import {
  loadMainSingle,
  loadStories,
  loadUnis,
  TTL,
} from "../cache/loadX";
import {
  cmsLinkDEV,
  cmsLinkPROD,
  internalCmsLink,
  resolveCmsUrl,
} from "../services/utils";
import { IImage } from "../types/selector";

type SocialNetworkItem = {
  name: string;
  icon: IImage | null;
  url: string;
};

type CountryOption = {
  id: string;
  name: string;
};

type ProductArticle = {
  id: string;
  code?: string | null;
  header?: string | null;
} | null;

type ProductImage = IImage | null;

const resolveMediaUrl = (baseUrl: string, url: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const extractImage = (raw: any, baseUrl: string): ProductImage => {
  const candidate = raw?.data?.attributes || raw?.attributes || raw || {};
  const url =
    typeof candidate?.url === "string"
      ? candidate.url
      : typeof raw?.url === "string"
        ? raw.url
        : null;
  if (!url) return null;

  return {
    id: String(candidate?.id || raw?.data?.id || raw?.id || url),
    url: resolveMediaUrl(baseUrl, url),
    alternativeText:
      typeof candidate?.alternativeText === "string"
        ? candidate.alternativeText
        : null,
    name: typeof candidate?.name === "string" ? candidate.name : null,
    formats: candidate?.formats,
  };
};

const extractArticle = (raw: any): ProductArticle => {
  const candidate = raw?.data?.attributes || raw?.attributes || raw || {};
  const id = candidate?.id || raw?.data?.id || raw?.id;
  const code = candidate?.code;
  const header = candidate?.header;

  if (!id && !code && !header) return null;
  return {
    id: String(id || code || header),
    code: typeof code === "string" ? code : null,
    header: typeof header === "string" ? header : null,
  };
};

const loadProducts = async (): Promise<IProduct[]> => {
  const env = process.env.NODE_ENV;
  const publicBase = env === "production" ? cmsLinkPROD : cmsLinkDEV;
  const cmsBase = resolveCmsUrl(publicBase, internalCmsLink);
  const adminUrl = `${cmsBase}/admin/content-manager/collectionType/api::product.product?page=1&pageSize=10&plugins[i18n][locale]=ru`;
  const apiUrl = `${cmsBase}/api/products?locale=ru&pagination[page]=1&pagination[pageSize]=10&populate=*`;

  const extractItems = (payload: any): IProduct[] => {
    const candidates = [
      ...(Array.isArray(payload?.results) ? payload.results : []),
      ...(Array.isArray(payload?.data) ? payload.data : []),
    ];

    return candidates
      .flatMap((item: any, index) => {
        const attrs = item?.attributes || item || {};
        const title = String(attrs?.title || "").trim();
        if (!title) return [];
        const rawRank = attrs?.rank;
        const rank =
          typeof rawRank === "number" && Number.isFinite(rawRank)
            ? rawRank
            : null;

        return [
          {
            id: String(item?.id || attrs?.id || attrs?.documentId || title),
            title,
            rank,
            subtitle_1:
              typeof attrs?.subtitle_1 === "string" ? attrs.subtitle_1 : null,
            subtitle_2:
              typeof attrs?.subtitle_2 === "string" ? attrs.subtitle_2 : null,
            subtitle_3:
              typeof attrs?.subtitle_3 === "string" ? attrs.subtitle_3 : null,
            image: extractImage(attrs?.image, cmsBase),
            icon_1: extractImage(attrs?.icon_1, cmsBase),
            icon_2: extractImage(attrs?.icon_2, cmsBase),
            icon_3: extractImage(attrs?.icon_3, cmsBase),
            article: extractArticle(attrs?.article),
            _index: index,
          },
        ];
      })
      .sort(
        (
          a: IProduct & { _index: number },
          b: IProduct & { _index: number },
        ) => {
          const aRanked = typeof a.rank === "number";
          const bRanked = typeof b.rank === "number";
          if (aRanked && bRanked && a.rank !== b.rank)
            return a.rank! - b.rank!;
          if (aRanked !== bRanked) return aRanked ? -1 : 1;
          return a._index - b._index;
        },
      )
      .map(({ _index, ...item }) => item);
  };

  try {
    const adminRes = await fetch(adminUrl);
    if (adminRes.ok) {
      const adminJson = await adminRes.json();
      const products = extractItems(adminJson);
      if (products.length) return products;
    }
  } catch {}

  try {
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) return [];
    const apiJson = await apiRes.json();
    return extractItems(apiJson);
  } catch {
    return [];
  }
};

const loadCountries = async (): Promise<CountryOption[]> => {
  const env = process.env.NODE_ENV;
  const publicBase = env === "production" ? cmsLinkPROD : cmsLinkDEV;
  const cmsBase = resolveCmsUrl(publicBase, internalCmsLink);
  const adminUrl = `${cmsBase}/admin/content-manager/collectionType/api::country.country?page=1&pageSize=200&sort=name:ASC`;
  const apiUrl = `${cmsBase}/api/countries?pagination[page]=1&pagination[pageSize]=200&sort=name:ASC`;

  const extractCountries = (payload: any): CountryOption[] => {
    const candidates = [
      ...(Array.isArray(payload?.results) ? payload.results : []),
      ...(Array.isArray(payload?.data) ? payload.data : []),
    ];

    return candidates
      .map((item: any) => {
        const id = item?.id || item?.documentId || item?.attributes?.id;
        const name = item?.name || item?.attributes?.name;
        if (!id || typeof name !== "string" || !name.trim()) return null;
        return { id: String(id), name };
      })
      .filter((country: any): country is CountryOption => Boolean(country));
  };

  try {
    const adminRes = await fetch(adminUrl);
    if (adminRes.ok) {
      const adminJson = await adminRes.json();
      const countries = extractCountries(adminJson);
      if (countries.length) return countries;
    }
  } catch {}

  try {
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) return [] as CountryOption[];
    const apiJson = await apiRes.json();
    return extractCountries(apiJson);
  } catch {
    return [] as CountryOption[];
  }
};

const loadSocialNetworks = async (): Promise<SocialNetworkItem[]> => {
  const env = process.env.NODE_ENV;
  const publicBase = env === "production" ? cmsLinkPROD : cmsLinkDEV;
  const cmsBase = resolveCmsUrl(publicBase, internalCmsLink);
  const adminUrl = `${cmsBase}/admin/content-manager/collectionType/api::socialnetwork.socialnetwork?page=1&pageSize=200&sort=name:ASC`;
  const apiUrl = `${cmsBase}/api/socialnetworks?pagination[page]=1&pagination[pageSize]=200&sort=name:ASC&populate=logo`;

  const extractItems = (payload: any): SocialNetworkItem[] => {
    const candidates = [
      ...(Array.isArray(payload?.results) ? payload.results : []),
      ...(Array.isArray(payload?.data) ? payload.data : []),
    ];

    return candidates
      .map((item: any) => {
        const attrs = item?.attributes || item || {};
        const name = attrs?.name;
        const url = attrs?.url;
        const iconRaw = attrs?.logo;
        const iconAttrs = iconRaw?.data?.attributes || iconRaw || {};
        const iconUrl =
          typeof iconAttrs?.url === "string"
            ? iconAttrs.url
            : typeof iconRaw === "string"
              ? iconRaw
              : null;
        const icon = iconUrl
          ? ({
              id: String(iconAttrs?.id || iconRaw?.data?.id || ""),
              url: iconUrl,
              alternativeText:
                typeof iconAttrs?.alternativeText === "string"
                  ? iconAttrs.alternativeText
                  : null,
            } as IImage)
          : null;
        return { name, icon, url: typeof url === "string" ? url : "" };
      })
      .filter(
        (item: any): item is SocialNetworkItem =>
          typeof item?.name === "string" &&
          !!item.name.trim() &&
          typeof item?.url === "string" &&
          !!item.url.trim(),
      );
  };

  try {
    const adminRes = await fetch(adminUrl);
    if (adminRes.ok) {
      const adminJson = await adminRes.json();
      const items = extractItems(adminJson);
      if (items.length) return items;
    }
  } catch {}

  try {
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) return [];
    const apiJson = await apiRes.json();
    return extractItems(apiJson);
  } catch {
    return [];
  }
};

const loadVisaFrom = async (cmsBase: string): Promise<IVisa | null> => {
  const apiUrl = `${cmsBase}/api/visa?locale=ru&populate=*`;

  try {
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) return null;
    const apiJson = await apiRes.json();
    const item = apiJson?.data || null;
    const attrs = item?.attributes || item || {};
    const header = typeof attrs?.header === "string" ? attrs.header : null;
    const subheader =
      typeof attrs?.subheader === "string" ? attrs.subheader : null;

    if (!header && !subheader && !attrs?.icon && !attrs?.image) return null;

    return {
      id: String(item?.id || attrs?.id || "visa"),
      header,
      subheader,
      icon: extractImage(attrs?.icon, cmsBase),
      image: extractImage(attrs?.image, cmsBase),
      article: extractArticle(attrs?.article),
    };
  } catch {
    return null;
  }
};

const loadVisa = async (): Promise<IVisa | null> => {
  const env = process.env.NODE_ENV;
  const publicBase = env === "production" ? cmsLinkPROD : cmsLinkDEV;
  const cmsBase = resolveCmsUrl(publicBase, internalCmsLink);
  const primary = await loadVisaFrom(cmsBase);
  if (primary) return primary;

  if (env !== "production" && internalCmsLink && internalCmsLink !== cmsBase) {
    return loadVisaFrom(internalCmsLink);
  }

  return null;
};

const MAIN_PAGE_REVALIDATE_SECONDS = TTL.slow;

export const getStaticProps = async () => {
  try {
    const [
      mainSingle,
      unis,
      countries,
      socialNetworks,
      stories,
      products,
      visa,
    ] = await Promise.all([
      loadMainSingle(true),
      loadUnis(true),
      loadCountries(),
      loadSocialNetworks(),
      loadStories(true),
      loadProducts(),
      loadVisa(),
    ]);

    const seo: ISEO = {
      title: mainSingle?.seo_title || mainSingle?.title || "Главная",
      description:
        mainSingle?.seo_subtitle || mainSingle?.subtitle || "Главная страница",
      canonicalSlug: "",
    };

    return {
      props: {
        seo: seo || nullSeo,
        mainSingle: (mainSingle || null) as IMainSingle | null,
        unis: (unis || []) as IUni[],
        popularPms: [],
        popularRates: null,
        mainTexts: [],
        rootText: null,
        reviews: [],
        countries: countries || [],
        socialNetworks: socialNetworks || [],
        stories: (stories || []) as IStory[],
        products: (products || []) as IProduct[],
        visa: (visa || null) as IVisa | null,
      },
      revalidate: MAIN_PAGE_REVALIDATE_SECONDS,
    };
  } catch (e) {
    console.error("Error during getStaticProps:", e);

    return {
      props: {
        seo: nullSeo,
        mainSingle: null,
        unis: [],
        popularPms: [],
        popularRates: null,
        mainTexts: [],
        rootText: null,
        reviews: [],
        countries: [],
        socialNetworks: [],
        stories: [],
        products: [],
        visa: null,
      },
      revalidate: MAIN_PAGE_REVALIDATE_SECONDS,
    };
  }
};

const Home = (props: any) => {
  return (
    <>
      <UniversalSeo seo={props.seo} />
      <Box position="relative" w="100%">
        <Box
          position="absolute"
          top="1%"
          left="50%"
          transform="translateX(-50%)"
          w="100vw"
          filter={{ base: "opacity(0.5)", lg: "opacity(0.3)" }}
          zIndex={0}
          pointerEvents="none"
        >
          <Box
            as="img"
            src={gridPattern.src}
            alt="Grid background pattern"
            w="100vw"
            h="auto"
          />
        </Box>
        <MainPageContent {...props} />
      </Box>
    </>
  );
};

export default Home;
