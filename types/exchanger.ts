import { ICurrency, IImage } from "./selector";
export interface IReview {
  honeypot: string;
  text: string;
  exchangerId: string;
  type?: "positive" | "neutral" | "negative" | "question";
  isExchangeDone?: boolean;
  gossip?: string;
  isDispute?: boolean | null;
  userAgent?: string;
  fingerprint?: string;
  ipAddress?: string;
  location?: string;
  review_categories?: string[] | { connect: string[] };
}

export interface ITopParameter {
  id: string;
  code?: string;
}

export interface IExchangerTemplate {
  id: string;
  include?: string | null;
  exclude?: string | null;
  cities?: string[] | null;
  top_parameter?: ITopParameter | null;
}

export interface IExchangerSummary {
  id: string;
  name?: string | null;
  display_name?: string | null;
  logo?: IImage | null;
}

export interface IExchangerOffice {
  id: string;
  visible?: boolean;
  coordinates?: string | null;
  city?: string | null;
  exchanger?: string | null;
  working_time?: string | null;
  description?: string | null;
  address?: string | null;
  image?: IImage | null;
}

export interface IExchangerMonitoringInfo {
  id: string;
  name?: string | null;
  url?: string | null;
  logo?: IImage | null;
}

export interface IExchangerMonitoring {
  id: string;
  link?: string | null;
  monitoring?: IExchangerMonitoringInfo | null;
}

export interface IExchangerCard {
  id: string;
  en_description?: string | null;
  ru_description?: string | null;
  text?: string | null;
  telegram?: string | null;
  email?: string | null;
  working_time?: string | null;
  phone_number?: string | null;
  whatsapp?: string | null;
  date_created?: string | null;
  total_reserve_usd?: number | string | null;
}

export interface IExchangerReviewReply {
  id: string;
  text?: string | null;
  from?: string | null;
  iaApproved?: boolean | null;
  updatedAt?: string | null;
  screenshots?: IImage[] | null;
}

export interface IReviewCategory {
  id?: string;
  title?: string | null;
  description?: string | null;
  isNegative?: boolean | null;
  image?: IImage[] | null;
}

export interface IExchangerReview {
  id: string;
  fingerprint?: string | null;
  ipAddress?: string | null;
  name?: string | null;
  text?: string | null;
  type?: string | null;
  isDispute?: boolean | null;
  isClosed?: boolean | null;
  isApproved?: boolean | null;
  isExchangeDone?: boolean | null;
  gossip?: string | null;
  review_categories?: IReviewCategory[] | null;
  userAgent?: string | null;
  location?: string | null;
  screenshots?: IImage[] | null;
  updatedAt?: string | null;
  review_replies?: IExchangerReviewReply[] | null;
  exchanger?: IExchangerSummary | null;
}

export interface IExchangerTag {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
}

export type IExchanger = {
  id: string;
  name: string;
  display_name?: string | null;
  ref_link: string;
  updatedAt?: string;
  status?: IExchangerStatus | null;
  admin_rating?: number | null;
  logo?: IImage | null;
  exchanger_card?: IExchangerCard | null;
  exchanger_templates?: IExchangerTemplate[];
  offices?: IExchangerOffice[];
  monitorings?: IExchangerMonitoring[] | null;
  reviews?: IExchangerReview[] | null;
  exchanger_tags?: IExchangerTag[] | null;
};

export type IExchangerPreview = {
  id: string;
  name: string;
  display_name?: string | null;
  ref_link: string;
};

export type IExchangerStatus = "active" | "suspended" | "disabled" | "paused";

export type IErrorCode =
  | "no-rates"
  | "ENOTFOUND"
  | "ECONNREFUSED"
  | "ECONNRESET"
  | "ETIMEDOUT"
  | "EPERM"
  | "ECONNABORTED"
  | "CERT_HAS_EXPIRED"
  | "ERR_FR_TOO_MANY_REDIRECTS"
  | "307"
  | "403"
  | "404"
  | "500"
  | "503"
  | "522"
  | "json-parsing-error"
  | "data-error"
  | "exchanger-custom-error"
  | "unknown";

export interface IExchangerParsingError {
  comment?: string;
  autoMessage?: string;
  code?: IErrorCode;
  codeExplanation?: string;
}

export interface IExchangerParsingInfo {
  rates: number;
  comment?: string;
}

export type IParserExchanger = {
  name: string;
  id: string;
  status: IExchangerStatus;
  total_rates?: number;
  skip?: number;
  error?: IExchangerParsingError;
  info?: IExchangerParsingInfo;
  warnings?: { [key: string]: string };
};

export interface IPhysicalRate {
  id: string;
  currency?: ICurrency;
  selling: number;
  buying: number;
}

export type IExchangerMapOffice = {
  id: string;
  exchangerId: string;
  name: string;
  lat: number;
  lng: number;
  address?: string | null;
  description?: string | null;
  working_time?: string | null;
  ref_link?: string | null;

  exchanger_card?: IExchanger["exchanger_card"];
  image?: IImage | null;
  visible?: boolean | null;
  usdRate?: number | null;
  contact?: string | null;
  city?: string | null;
};

export type IDotColors = "green" | "orange" | "gray" | "red";
