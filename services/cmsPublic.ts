import { IImage } from "../types/selector";
import { cmsLinkDEV, cmsLinkPROD, internalCmsLink, resolveCmsUrl } from "./utils";

export type SocialNetworkItem = {
  name: string;
  icon: IImage | null;
  url: string;
};

export type CountryOption = {
  id: string;
  name: string;
};

export type RealPictureItem = {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  main_image?: IImage | null;
  small_images?: IImage[] | null;
};

export const resolveMediaUrl = (baseUrl: string, url: string) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const getCmsBase = () => {
  const publicBase =
    process.env.NODE_ENV === "production" ? cmsLinkPROD : cmsLinkDEV;
  return resolveCmsUrl(publicBase, internalCmsLink);
};

export const loadCountries = async (): Promise<CountryOption[]> => {
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

export const loadSocialNetworks = async (): Promise<SocialNetworkItem[]> => {
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

const extractCmsImage = (raw: any, baseUrl: string): IImage | null => {
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

export const loadRealPicture = async (): Promise<RealPictureItem | null> => {
  const cmsBase = getCmsBase();
  const apiUrl = `${cmsBase}/api/real-picture?populate[main_image]=*&populate[small_images]=*`;

  try {
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) return null;

    const apiJson = await apiRes.json();
    const item = apiJson?.data || null;
    const attrs = item?.attributes || item || {};
    const title =
      typeof attrs?.title === "string" && attrs.title.trim()
        ? attrs.title.trim()
        : null;
    const subtitle =
      typeof attrs?.subtitle === "string" && attrs.subtitle.trim()
        ? attrs.subtitle.trim()
        : null;
    const mainImage = extractCmsImage(attrs?.main_image, cmsBase);
    const smallImages = (Array.isArray(attrs?.small_images?.data)
      ? attrs.small_images.data
      : Array.isArray(attrs?.small_images)
        ? attrs.small_images
        : []
    )
      .map((image: any) => extractCmsImage(image, cmsBase))
      .filter((image: IImage | null): image is IImage => Boolean(image));

    if (!title && !subtitle && !mainImage && !smallImages.length) return null;

    return {
      id: String(item?.id || attrs?.id || "real-picture"),
      title,
      subtitle,
      main_image: mainImage,
      small_images: smallImages,
    };
  } catch {
    return null;
  }
};
