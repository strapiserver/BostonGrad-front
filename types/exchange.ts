import { IExchanger, IParserExchanger } from "./exchanger";
import { IArticle } from "./pages";
import { IPm, ISelector } from "./selector";

export type ISectionName = "crypto" | "bank" | "cash" | "digital" | "transfer";

//export type IDonors = { [key: string]: { [key: string]: string } };
// {BTC_CASHRUB: {samara: "moscow"}}

export interface IDirText {
  text: string;
  seo_title: string;
  seo_description: string;
  header: string;
  default_header?: string;
  subheader: string;
  updatedAt?: string;
  h1?: string;
}

export interface IPath {
  params: {
    exchange: string;
  };
  locale: string;
}

export type ILocalData = {
  dirsTexts: IDirText[];
};

export type IPmData = {
  pm: IPm;
  exists: boolean;
};

export interface ICache {
  pms: IPm[];
  slugToCodes: { [key: string]: string }; // для запроса курсов
  cities: ICity[];
  possiblePairs?: { [key: string]: string[] };
  exchangePaths?: IPath[];
  //donors?: IDonors;
  enData: ILocalData;
  ruData: ILocalData;
  exchangers?: IExchanger[];
}

export interface IPossiblePmPair {
  givePm?: IPm;
  getPm?: IPm;
}

// export interface ICities {
//   [key: string]: [string, string];
// }
export interface ICity {
  codes: string[];
  en_name: string;
  ru_name: string;
  population: number;
  coordinates: number[];
  preposition: string;
  closest_cities: { en_name: string; ru_name: string }[];
  en_country_name: string;
  ru_country_name: string;
  channel?: string;
}

export interface IPmPairs {
  slug: string;
  givePm?: IPm;
  getPm?: IPm;
}

export interface ISeoData {
  givePm: IPm;
  getPm: IPm;
  locale: "en" | "ru";
  seo_title: string;
  seo_description: string;
  slug: string;
  city: ICity | null;
}
