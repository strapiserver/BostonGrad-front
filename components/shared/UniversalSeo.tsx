import { NextSeo, BreadcrumbJsonLd } from "next-seo";
import { ISEO, BreadcrumbItem } from "../../types/general";
export const nullSeo = {
  title: "BostonGrad",
  description: "Летние образовательные программы в США",
  canonicalSlug: "",
  breadcrumbs: [],
  updatedAt: null,
};

const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://bostongrad.com"
).replace(/\/+$/, "");

const UniversalSeo = ({ seo }: { seo: ISEO }) => {
  const {
    title,
    description,
    canonicalSlug,
    updatedAt = new Date().toISOString(),
    breadcrumbs,
  } = seo;
  const canonicalPath = String(canonicalSlug || "").replace(/^\/+/, "");
  const fullCanonicalUrl = canonicalPath
    ? `${siteUrl}/${canonicalPath}`
    : siteUrl;
  const ogType = updatedAt ? "article" : "website";

  const openGraph = {
    type: ogType,
    url: fullCanonicalUrl,
    title,
    description,
    site_name: "BostonGrad",
    locale: "ru_RU",
    ...(updatedAt
      ? {
          article: {
            publishedTime: updatedAt,
            modifiedTime: updatedAt,
          },
        }
      : {}),
  };

  const defaultBreadcrumbs: BreadcrumbItem[] = [
    {
      position: 1,
      name: "Главная",
      item: siteUrl,
    },
    {
      position: 2,
      name: title,
      item: fullCanonicalUrl,
    },
  ];

  return (
    <>
      <NextSeo
        title={title}
        description={description}
        canonical={fullCanonicalUrl}
        openGraph={openGraph}
      />
      <BreadcrumbJsonLd
        itemListElements={
          breadcrumbs?.length ? breadcrumbs : defaultBreadcrumbs
        }
      />
    </>
  );
};

export default UniversalSeo;
