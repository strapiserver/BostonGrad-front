import { IArticle } from "../../types/pages";
import { addArticleCrossLinking } from "../../components/articles/pmArticle/helper";
import { ISEO } from "../../types/general";
import { nullSeo } from "../../components/shared/UniversalSeo";
import { IImage } from "../../types/selector";
import {
  CountryOption,
  SocialNetworkItem,
  getCmsBase,
  loadCountries,
  loadSocialNetworks,
  resolveMediaUrl,
} from "../../services/cmsPublic";
import {
  loadArticle,
  loadArticleCodes,
  TTL,
} from "../../cache/loadX";
import { addPathsToSitemap } from "../../cache/cache";
import GeneralArticle from "../../components/articles/generalArticle";
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

const articleWithResolvedMedia = (article: IArticle, baseUrl: string): IArticle => {
  const resolveImage = (img?: IImage | null): IImage | null => {
    if (!img?.url) return img || null;
    return { ...img, url: resolveMediaUrl(baseUrl, img.url) };
  };

  return {
    ...article,
    preview: resolveImage(article.preview),
    wallpaper: resolveImage(article.wallpaper),
  };
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
    const readyArticle = articleWithResolvedMedia(textArticle, getCmsBase());

    return {
      props: {
        seo: seo || nullSeo,
        article: readyArticle || null,
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
