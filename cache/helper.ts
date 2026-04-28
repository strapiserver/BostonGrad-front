import {
  getPmsFromPmGroup,
  pmsToSlug,
} from "../components/main/side/selector/section/PmGroup/helper";
import { mylog } from "../services/utils";

import { IPossiblePmPair } from "../types/exchange";
import { IExchanger } from "../types/exchanger";
import { ParserCityDirections } from "../types/map";
import { IMassDirTextId } from "../types/mass";
import { ISelector, IPm, IPmGroup, ISection } from "../types/selector";

export const getPmsFromSelector = (selector: ISelector): IPm[] => {
  const pmGroups: IPmGroup[] = selector.sections.flatMap((section: ISection) =>
    section.pm_groups.map((pmg) => ({
      ...pmg,
      section: section.en_title.toLowerCase(),
    }))
  );

  const pms: IPm[] = pmGroups.flatMap((pmGroup) => {
    const extracted = getPmsFromPmGroup(pmGroup);
    if (!extracted?.length) console.log("Missing PMs in group:", pmGroup);
    return extracted || [];
  });
  return pms;
};

export const getSlugToCodes = (dirs: string[], pms: IPm[]) => {
  const pmMap = new Map(pms.map((pm) => [pm.code.toUpperCase(), pm]));
  const slugToCodes: Record<string, string> = dirs.reduce((acc, dir) => {
    const [give, get] = dir.split("_");
    const pair: IPossiblePmPair = {
      givePm: pmMap.get(give),
      getPm: pmMap.get(get),
    };
    const slug = pmsToSlug(pair);
    return slug ? { ...acc, [slug]: dir } : acc;
  }, {});

  return slugToCodes;
};

export const getCodesToSlug = (dirs: string[], pms: IPm[]) => {
  const slugToCodes = getSlugToCodes(dirs, pms);
  return Object.entries(slugToCodes).reduce(
    (acc, [slug, codes]) => ({
      ...acc,
      [codes]: slug,
    }),
    {} as Record<string, string>
  );
};

const MIN_RATE = Number(process.env.NEXT_PUBLIC_RATES_RENDER_MIN ?? 10);

export const _convertCityDirectionData = (
  cityDirectionsData: ParserCityDirections | null
): Record<string, string[]> => {
  if (!cityDirectionsData) return {};

  const result: Record<string, string[]> = {};

  for (const [cityName, rates] of Object.entries(cityDirectionsData)) {
    for (const [direction, rateAmount] of Object.entries(rates)) {
      if (rateAmount <= MIN_RATE) continue;

      if (!result[direction]) {
        result[direction] = [];
      }

      result[direction].push(cityName);
    }
  }

  return result;
};

export const getCitySlugs = (
  slugToCodes: Record<string, string>,
  cityDirectionsData: ParserCityDirections | null
): string[] => {
  const dirToCities = _convertCityDirectionData(cityDirectionsData);
  const normalizeCitySlug = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, "-");
  const collectedSlugs: string[] = [];
  const seen = new Set<string>();
  Object.entries(slugToCodes).forEach(([slug, dir]) => {
    const isCash =
      (slug && slug.startsWith("cash-")) || slug.includes("-cash-");
    if (!isCash || !dirToCities[dir]) return;

    const newSlugs = dirToCities[dir]
      .map((city) => normalizeCitySlug(city))
      .filter(Boolean)
      .map((city) => `${slug}-in-${city}`);
    for (const newSlug of newSlugs) {
      if (seen.has(newSlug)) continue;
      seen.add(newSlug);
      collectedSlugs.push(newSlug);
    }
  });
  return collectedSlugs;
};

// export const mergeExchangers = (
//   allExchangers?: IExchanger[],
//   parserExchangers?: Record<string, IParserExchanger>
// ) => {
//   if (!allExchangers || !parserExchangers) {
//     mylog("NO EXCHANGERS", "error");
//     return (allExchangers || parserExchangers || []) as (IExchanger )[];
//   }
//   return allExchangers.map((ex) => {
//     const parserExchanger = parserExchangers?.[ex.id];
//     return {
//       ...parserExchanger,
//       ...ex,
//     } as IExchanger ;
//   });
// };

export const convertMassDirTextIntoSlug = (
  massDirTextId: IMassDirTextId
): string => {
  const { code, currency } = massDirTextId;
  return `${code.toLowerCase()}-for-${currency.code.toLowerCase()}`;
};

export const convertSlugIntoMassDirText = (
  slug: string,
  isSell: boolean
): IMassDirTextId => {
  const [leftSide, _for, rightSide] = slug.split("-");
  return {
    isSell,
    code: leftSide.toUpperCase(),
    currency: { code: rightSide.toUpperCase() },
  };
};
