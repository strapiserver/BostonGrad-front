import type { IUni } from "../../../types/pages";

export const truncateTo100 = (text?: string) => {
  if (!text) return "";
  return text.length > 100 ? `${text.slice(0, 100)}...` : text;
};

const getArticleHref = (code?: string | null) => {
  const normalizedCode = String(code || "")
    .trim()
    .replace(/^\/?articles\//i, "")
    .replace(/^\//, "")
    .toLowerCase();

  return normalizedCode ? `/articles/${normalizedCode}` : "";
};

export const getUniHref = (uni: IUni) => {
  if (uni.article) {
    return getArticleHref(uni.article.code);
  }

  const slug = String(uni.slug || "").trim();
  if (!slug) return "";
  return slug.startsWith("/") ? slug : `/${slug}`;
};
