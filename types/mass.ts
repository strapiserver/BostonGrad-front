import { IImage, IPm as SelectorPm } from "./selector";

export interface IMassDirTextId {
  code: string;
  currency: {
    code: string;
  };
  isSell: boolean;
}

export type IMassDirText = {
  header: string;
  subheader: string;
  seo_title: string;
  seo_description: string;
  text: string;
} & IMassDirTextId;

export type IMassRate = {
  exchangerId: number;
  name: string;
  admin_rating: number;
  course: number;
  parameterCodes: string[];
  ref_link: string;
  last_time_updated: number;
  min: { give: number; get: number };
  max: { give: number; get: number };
  codes: string[];
  logo: IImage;
};

export interface IMassSort {
  key: "limit" | "course" | "admin_rating";
  direction: "asc" | "desc";
}

export type IMassPm = SelectorPm;
export type IPm = IMassPm;
