import { IPm } from "../../types/selector";

export type MapHeadings = {
  h1: string;
  h2: string;
  description: string;
  empty: string;
  directionsTitle: string;
  directionsEmpty: string;
};

export type CityCashEntry = {
  slug: string;
  cryptoPm: IPm;
  count: number;
};

export type CityCashSection = {
  currencyCode: string;
  currencyName: string;
  cashPm: IPm;
  buyTitle: string;
  sellTitle: string;
  buy: CityCashEntry[];
  sell: CityCashEntry[];
};
