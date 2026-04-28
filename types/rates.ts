import { IImage } from "./selector";

export type ISides = "give" | "get";
export type ILimit = { [key in ISides]: number };

interface IBaseRate {
  exchangerId: string;
  name: string;
  display_name: string;
  admin_rating: number;
  course: number;
  p2pRatio?: number;
  min_fee?: string;
  from_fee?: string;
  to_fee?: string;
  min: ILimit;
  max: ILimit;
  reserve: ILimit;
  parameterCodes?: string[];
  cities?: { [key: string]: string[] };
  ref_link: string;
  logo?: IImage | null;
  last_time_updated?: number;
  tag?: string | null;
  offices?: Array<Record<string, unknown>>;
  source_total_rates?: number;
}

export interface IRate extends IBaseRate {
  cityRates?: Record<string, { rate: IBaseRate }>;
}

export interface IParameter {
  id: string;
  code: string;
  en_name: string;
  ru_name: string;
  type?: "p2p_maker" | "p2p_offer" | null;
  color?: string;
  parameter: {
    id: string;
    en_description: string;
    ru_description: string;
    icon: IImage;
  };
}

export type ExchangerId = string;

export interface IPopularDirRates {
  [key: string]: {
    buy: IPopularRate[];
    sell: IPopularRate[];
  };
}

export interface IPopularRate {
  exchangerId: string;
  course: number;
  fiat: string;
  exchangers?: number;
}
