import { NextSeo, BreadcrumbJsonLd } from "next-seo";
import { ISEO, BreadcrumbItem } from "../../types/general";
export const nullSeo = {
  title: null,
  description: null,
  canonicalSlug: null,
  breadcrumbs: [],
  updatedAt: null,
};

const UniversalSeo = ({ seo }: { seo: ISEO }) => {
  const {
    title,
    description,
    canonicalSlug,
    updatedAt = new Date().toISOString(),
    breadcrumbs,
  } = seo;
  const fullCanonicalUrl = `https://${process.env.NEXT_PUBLIC_NAME}.com/${canonicalSlug}`;
  const ogType = updatedAt ? "article" : "website";

  const openGraph = {
    type: ogType,
    url: fullCanonicalUrl,
    title,
    description,
    site_name: `${process.env.NEXT_PUBLIC_NAME}`,
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
      item: `https://${process.env.NEXT_PUBLIC_NAME}.com`,
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
