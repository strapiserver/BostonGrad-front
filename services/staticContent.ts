import snapshot from "../data/cmsSnapshot.json";
import type {
  IArticle,
  IMainSingle,
  IProduct,
  IRealPicture,
  IStory,
  IUni,
  IVisa,
} from "../types/pages";
import type { CountryOption, SocialNetworkItem } from "./cmsPublic";

type StaticContent = {
  mainSingle: IMainSingle | null;
  unis: IUni[];
  products: IProduct[];
  stories: IStory[];
  visa: IVisa | null;
  realPicture: IRealPicture | null;
  countries: CountryOption[];
  socialNetworks: SocialNetworkItem[];
  articles: IArticle[];
};

export const staticContent = snapshot as unknown as StaticContent;

export const loadStaticArticleCodes = () =>
  staticContent.articles.map((article) => article.code).filter(Boolean);

export const loadStaticArticle = (code: string) =>
  staticContent.articles.find(
    (article) => article.code.toLowerCase() === code.toLowerCase(),
  ) || null;
