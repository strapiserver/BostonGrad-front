import { capitalize } from "../main/side/selector/section/PmGroup/helper";
import { ICity, IDirText, ISeoData } from "../../types/exchange";
import { IPm } from "../../types/selector";
import { loadDirText } from "../../cache/loadX";
import { ISEO } from "../../types/general";
import { getPmNameFromPm } from "../shared/helper";


export const generateExchangeH1 = (
  givePm: IPm,
  getPm: IPm,
  city: ICity | null,
  options?: {
    articleCodes?: string[];
    cityPageExists?: boolean;
  }
) => {
  const { articleCodes = [], cityPageExists = !!city } = options || {};

  const toSlug = (value?: string | null) =>
    (value || "").trim().toLowerCase().replace(/\s+/g, "-");

  const pmHasArticle = (pm: IPm) =>
    !!articleCodes.find((code) => toSlug(code) === toSlug(pm.en_name));

  const wrapWithArticleLink = (pm: IPm) => {
    const pmName = getPmNameFromPm(pm);
    return pmHasArticle(pm)
      ? `[${pmName}](/articles/${toSlug(pm.en_name)})`
      : pmName;
  };

  // Article links for PMs (only when article exists)
  const linkedGiveName = wrapWithArticleLink(givePm);
  const linkedGetName = wrapWithArticleLink(getPm);

  // City addon
  const cityLabel = city
    ? (city.preposition || city.ru_name || city.en_name || "") ?? ""
    : "";

  const citySlug = city ? toSlug(city.en_name) : "";
  const linkedCity =
    city && cityPageExists && citySlug
      ? `[${cityLabel}](/map/${citySlug})`
      : cityLabel;

  const cityAddon = cityLabel ? ` в ${linkedCity}` : "";

  // Subgroup
  const giveSubgroup = givePm.subgroup_name ? ` ${givePm.subgroup_name}` : "";
  const getSubgroup = getPm.subgroup_name ? ` ${getPm.subgroup_name}` : "";

  const giveCur = givePm.currency.code.toUpperCase();
  const getCur = getPm.currency.code.toUpperCase();

  return `Обмен ${linkedGiveName}  на ${linkedGetName}   ${cityAddon}`;
};

export const dirTextHandler = async ({
  givePm,
  getPm,
  customDirText,
  city,
  articleCodes,
}: {
  givePm: IPm;
  getPm: IPm;
  customDirText?: IDirText;
  city: ICity | null;
  articleCodes?: string[];
}): Promise<IDirText> => {
  // Default header
  const h1 = generateExchangeH1(givePm, getPm, city, {
    articleCodes,
    cityPageExists: !!city,
  });

  const cityName = city?.preposition || city?.ru_name || city?.en_name || "";

  // Placeholder replacer
  const replacer = (text?: string) =>
    fillWords({
      givePm,
      getPm,
      cityName,
      text,
    });

  // SEO fields
  const fields = [
    "seo_description",
    "seo_title",
    "text",
    "header",
    "subheader",
  ] as const;

  let dirText = {} as IDirText;
  const applyFilledFields = (source: IDirText = {} as IDirText) => {
    const filled = Object.fromEntries(
      fields.map((f) => [
        f,
        replacer(
          source[f] ??
            `${givePm.ru_name || givePm.en_name} → ${
              getPm.ru_name || getPm.en_name
            }`
        ),
      ])
    );

    return {
      ...source,
      ...filled,
      h1,
    };
  };

  if (customDirText?.header) {
    return applyFilledFields(customDirText);
  }

  const fallbackDirText = await loadDirText(givePm.section, getPm.section);
  dirText = fallbackDirText;

  const cityLabel = city?.preposition || city?.ru_name || city?.en_name || "";
  const citySuffix = cityLabel ? ` в ${cityLabel}` : "";

  dirText.seo_title = `${dirText.seo_title} ${citySuffix}`;
  dirText.seo_description = `${dirText.seo_description} ${citySuffix}`;

  return applyFilledFields(dirText);
};

export const fillWords = ({
  givePm,
  getPm,
  cityName,
  text,
}: {
  givePm: IPm;
  getPm: IPm;
  cityName?: string;
  text?: string;
}) =>
  (text || "")
    .replaceAll(
      "give_name",
      capitalize(givePm.ru_name || givePm.en_name)
    )
    .replaceAll(
      "get_name",
      capitalize(getPm.ru_name || getPm.en_name)
    )
    .replaceAll(
      "give_currency",
      `${givePm.currency.code.toUpperCase()} ${givePm.subgroup_name || ""}`
    )
    .replaceAll(
      "get_currency",
      `${getPm.currency.code.toUpperCase()} ${getPm.subgroup_name || ""}`
    )
    .replaceAll("city_name", cityName || "");

export const findSimilarPmPairs = (
  givePm: IPm,
  getPm: IPm,
  pms: IPm[],
  dirs: string[]
) => {
  const similarLevel1 = pms.reduce((res: IPm[][], pm: IPm) => {
    let [pair1, pair2] = [[], []] as [IPm[], IPm[]];
    if (
      pm.currency.code == givePm.currency.code &&
      pm.section == givePm.section &&
      dirs.find((dir) => dir === `${pm.code}_${getPm.code}`)
    ) {
      pair1 = [pm, getPm];
    }
    if (
      pm.currency.code == getPm.currency.code &&
      pm.section == getPm.section &&
      dirs.find((dir) => dir === `${givePm.code}_${pm.code}`)
    ) {
      pair2 = [givePm, pm];
    }
    return [
      ...res,
      ...(pair1.length ? [pair1] : []),
      ...(pair2.length ? [pair2] : []),
    ];
  }, []);

  const similarLevel2 = pms.reduce((res: IPm[][], pm: IPm) => {
    let [pair1, pair2] = [[], []] as [IPm[], IPm[]];
    if (
      pm.currency.code == givePm.currency.code &&
      dirs.find((dir) => dir === `${pm.code}_${getPm.code}`)
    ) {
      pair1 = [pm, getPm];
    }
    if (
      pm.currency.code == getPm.currency.code &&
      dirs.find((dir) => dir === `${givePm.code}_${pm.code}`)
    ) {
      pair2 = [givePm, pm];
    }
    return [
      ...res,
      ...(pair1.length ? [pair1] : []),
      ...(pair2.length ? [pair2] : []),
    ];
  }, []);

  const similarLevel3 = pms.reduce((res: IPm[][], pm: IPm) => {
    let [pair1, pair2] = [[], []] as [IPm[], IPm[]];
    if (
      pm.section == givePm.section &&
      dirs.find((dir) => dir === `${pm.code}_${getPm.code}`)
    ) {
      pair1 = [pm, getPm];
    }
    if (
      pm.section == getPm.section &&
      dirs.find((dir) => dir === `${givePm.code}_${pm.code}`)
    ) {
      pair2 = [givePm, pm];
    }
    return [
      ...res,
      ...(pair1.length ? [pair1] : []),
      ...(pair2.length ? [pair2] : []),
    ];
  }, []);
  const allPairs = [...similarLevel1, ...similarLevel2, ...similarLevel3];
  const uniquePairs = allPairs.filter((pair, index, self) => {
    // Remove pairs with identical elements or already present pairs in reverse
    return (
      index ===
      self.findIndex(
        (otherPair) =>
          (pair[0].code === otherPair[0].code &&
            pair[1].code === otherPair[1].code) ||
          (pair[0].code === otherPair[1].code &&
            pair[1].code === otherPair[0].code)
      )
    );
  });

  return uniquePairs
    .filter(
      (pair) =>
        !(
          (pair[0].code == givePm.code && pair[1].code == getPm.code) ||
          pair[0].code == pair[1].code
        )
    )
    .slice(0, 11);
};

export const exchangeToSlugCity = (exchange: string) => {
  if (
    !exchange?.includes("-in-") ||
    (!exchange.startsWith("cash-") && !exchange.includes("-cash-"))
  ) {
    return [exchange, ""];
  }
  const lastIndex = exchange.lastIndexOf("-in-");
  return [exchange.slice(0, lastIndex), exchange.slice(lastIndex + 4)];
};

export const slugCityToExchange = (slug: string, city?: string) => {
  return `${slug}${
    (slug.startsWith("cash-") || slug.includes("-cash-")) && city
      ? "-in-" + city?.replaceAll(" ", "-").toLowerCase()
      : ""
  }`;
};

export const generateExchangeSeo = ({
  dirText,
  slug,
  city,
}: {
  dirText: IDirText;
  slug: string;
  city: ICity | null;
}): ISEO => {
  const slugPath = slugCityToExchange(slug, city?.en_name);

  return {
    title: dirText?.seo_title || "",
    description: dirText?.seo_description || "",
    canonicalSlug: slugPath,
    breadcrumbs: [
      {
        position: 1,
        name: "Главная",
        item: `https://${process.env.NEXT_PUBLIC_NAME}.com`,
      },
      {
        position: 2,
        name: dirText?.seo_title || `${dirText.default_header}`,
        item: `https://${process.env.NEXT_PUBLIC_NAME}.com/${slugPath}`,
      },
    ],
  };
};

export const getOtherMass = (
  pairs: IPm[][],
  givePm?: IPm,
  getPm?: IPm
): IPm[] => {
  if (!pairs.length) return [];

  const seen = new Set<string>();
  const result: IPm[] = [];

  const excludeKeys = new Set<string>();
  if (givePm) excludeKeys.add(givePm.code + "|" + (givePm.subgroup_name ?? ""));
  if (getPm) excludeKeys.add(getPm.code + "|" + (getPm.subgroup_name ?? ""));

  for (const pair of pairs) {
    for (const pm of pair) {
      const key = pm.code + "|" + (pm.subgroup_name ?? "");
      if (!seen.has(key) && !excludeKeys.has(key)) {
        seen.add(key);
        result.push(pm);
      }
    }
  }

  return result;
};
