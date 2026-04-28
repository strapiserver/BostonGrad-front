import { IArticle } from "../../types/pages";
import { addArticleCrossLinking } from "../../components/articles/pmArticle/helper";
import { ISEO } from "../../types/general";
import { nullSeo } from "../../components/shared/UniversalSeo";
import { IImage } from "../../types/selector";

import {
  loadArticle,
  loadArticleCodes,
  TTL,
} from "../../cache/loadX";
import { addPathsToSitemap } from "../../cache/cache";
import GeneralArticle from "../../components/articles/generalArticle";
import {
  cmsLinkDEV,
  cmsLinkPROD,
  internalCmsLink,
  resolveCmsUrl,
} from "../../services/utils";

type SocialNetworkItem = {
  name: string;
  icon: IImage | null;
  url: string;
};

type CountryOption = {
  id: string;
  name: string;
};

const resolveMediaUrl = (baseUrl: string, url: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

const getCmsBase = () => {
  const publicBase = process.env.NODE_ENV === "production" ? cmsLinkPROD : cmsLinkDEV;
  return resolveCmsUrl(publicBase, internalCmsLink);
};

const loadCountries = async (): Promise<CountryOption[]> => {
  const cmsBase = getCmsBase();
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
      const countries = extractCountries(await adminRes.json());
      if (countries.length) return countries;
    }
  } catch {}

  try {
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) return [];
    return extractCountries(await apiRes.json());
  } catch {
    return [];
  }
};

const loadSocialNetworks = async (): Promise<SocialNetworkItem[]> => {
  const cmsBase = getCmsBase();
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
              url: resolveMediaUrl(cmsBase, iconUrl),
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
      const items = extractItems(await adminRes.json());
      if (items.length) return items;
    }
  } catch {}

  try {
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) return [];
    return extractItems(await apiRes.json());
  } catch {
    return [];
  }
};

const emptyProps = async () => ({
  props: {
    seo: nullSeo,
    article: null,
    countries: await loadCountries(),
    socialNetworks: await loadSocialNetworks(),
  },
  revalidate: TTL.slow,
});

const articleToText = (article: IArticle): IArticle => {
  if (article.text) return article;
  const chapters = Array.isArray(article.chapters) ? article.chapters : [];
  const fallbackText = chapters
    .map((ch) => {
      const title = String(ch?.title || "").trim();
      const text = String(ch?.text || "").trim();
      if (!title && !text) return "";
      return title ? `## ${title}\n\n${text}`.trim() : text;
    })
    .filter(Boolean)
    .join("\n\n");

  return { ...article, text: fallbackText };
};

const ArticlePage = (props: {
  seo: ISEO;
  article: IArticle | null;
  countries?: CountryOption[];
  socialNetworks?: SocialNetworkItem[];
}) => {
  return (
    <GeneralArticle
      article={props.article}
      seo={props.seo}
      countries={props.countries || []}
      socialNetworks={props.socialNetworks || []}
    />
  );
};

export async function getStaticProps({ params }: { params: { code: string } }) {
  try {
    const code = params.code;
    const article = await loadArticle(code);
    if (!article) {
      console.warn(
        `[getStaticProps] No article found for code: ${params.code}`
      );
      return emptyProps();
    }
    const normalizedCode = article?.code.toLowerCase();

    const seo = {
      title: article.seo_title,
      description: article.seo_description,
      canonicalSlug: `articles/${normalizedCode}`,
      updatedAt: article.updatedAt || new Date().toISOString(),
    } as ISEO;

    const [articleCodes, countries, socialNetworks] = await Promise.all([
      loadArticleCodes(),
      loadCountries(),
      loadSocialNetworks(),
    ]);
    const linkedArticle = await addArticleCrossLinking(article, articleCodes);
    const textArticle = articleToText(linkedArticle);

    return {
      props: {
        seo: seo || nullSeo,
        article: textArticle || null,
        countries,
        socialNetworks,
      },
      revalidate: TTL.slowest,
    };
  } catch (e) {
    console.error("[getStaticProps] Error:", e);
    return await emptyProps();
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////

export async function getStaticPaths() {
  try {
    const paths: { params: { code: string } }[] = [];
    const articleCodes = (await loadArticleCodes()) as string[];

    articleCodes.forEach((code) => {
      paths.push({
        params: { code: code.toLowerCase() },
      });
    });

    const prerenderLimit = process.env.NEXT_PUBLIC_PRERENDER_LIMIT
      ? Number(process.env.NEXT_PUBLIC_PRERENDER_LIMIT)
      : 5000;

    const slicedPaths = paths.slice(0, prerenderLimit);
    await addPathsToSitemap(paths, { basePath: "articles" });

    return {
      paths: slicedPaths,
      fallback: "blocking",
    };
  } catch (e) {
    console.error("Articles [getStaticPaths] Error while generating paths", e);
    return { paths: [], fallback: "blocking" };
  }
}

export default ArticlePage;
