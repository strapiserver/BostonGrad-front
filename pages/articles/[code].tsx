import { IArticle } from "../../types/pages";
import { addArticleCrossLinking } from "../../components/articles/pmArticle/helper";
import { ISEO } from "../../types/general";
import { nullSeo } from "../../components/shared/UniversalSeo";
import type {
  CountryOption,
  SocialNetworkItem,
} from "../../services/cmsPublic";
import {
  loadStaticArticle,
  loadStaticArticleCodes,
  staticContent,
} from "../../services/staticContent";
import { addPathsToSitemap } from "../../cache/cache";
import GeneralArticle from "../../components/articles/generalArticle";
const emptyProps = async () => ({
  props: {
    seo: nullSeo,
    article: null,
    countries: staticContent.countries,
    socialNetworks: staticContent.socialNetworks,
  },
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
    const article = loadStaticArticle(code);
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

    const articleCodes = loadStaticArticleCodes();
    const linkedArticle = await addArticleCrossLinking(article, articleCodes);
    const readyArticle = articleToText(linkedArticle);

    return {
      props: {
        seo: seo || nullSeo,
        article: readyArticle || null,
        countries: staticContent.countries,
        socialNetworks: staticContent.socialNetworks,
      },
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
    const articleCodes = loadStaticArticleCodes();

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
      fallback: false,
    };
  } catch (e) {
    console.error("Articles [getStaticPaths] Error while generating paths", e);
    return { paths: [], fallback: "blocking" };
  }
}

export default ArticlePage;
