import { IArticle } from "../../../types/pages";

import { enrichText } from "../../shared/helper";
import { IPm } from "../../../types/selector";

export const addArticleCrossLinking = async (
  article: IArticle,
  articleCodes: string[],
  pms: IPm[] = []
): Promise<IArticle> => {
  const sourceChapters = Array.isArray(article?.chapters) ? article.chapters : [];
  if (!sourceChapters.length) return article;

  const seen = new Set<string>();
  const chapters = await Promise.all(
    sourceChapters.map(async (chapter) => ({
      ...chapter,
      text: chapter.text
        ? enrichText({ seen, text: chapter.text, articleCodes, pms })
        : "",
    }))
  );

  return { ...article, chapters };
};
