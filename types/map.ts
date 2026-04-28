import { ClosestCityMatch } from "../components/map/helper";
import { MapHeadings, CityCashSection } from "../components/map/types";
import { ICity, IDirText } from "./exchange";
import { IExchanger } from "./exchanger";
import { ISEO } from "./general";
import { IPm } from "./selector";

export type ParserCityDirections = Record<string, Record<string, number>>;
export type ParsedDirection = {
  slug: string;
  givePm: IPm;
  getPm: IPm;
  count: number;
};

export type MapCityPageProps = {
  city: ICity;
  exchangerList: IExchanger[];
  seo: ISEO;
  headings: MapHeadings;
  cashSections: CityCashSection[];
  cityText: IDirText | null;
  closestCities: ClosestCityMatch[];
};
