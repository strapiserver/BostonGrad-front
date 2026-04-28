import {
  IOption,
  IPmGroup,
  IPm,
  IPmPointer,
  IPopularAs,
} from "../../../../../../types/selector";

export const capitalize = (s: string | undefined) => {
  if (typeof s !== "string") return "";
  const words = s.split(" ");
  const res = words
    .map((w, index) =>
      index > 0 && w.length < 4
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(" ");
  return res;
};

const getOptionCode = (option: IOption, prefix?: string): string => {
  return (
    (option?.code && option?.code.toUpperCase()) || // USDTERC
    (prefix &&
      prefix.toUpperCase() !== option?.currency?.code.toUpperCase() &&
      prefix.toUpperCase() + option?.currency?.code.toUpperCase()) || // SBERRUB
    option?.currency?.code.toUpperCase()
  ); // BTC
};
export const getPmsFromPmGroup = (
  pm_group: IPmGroup,
  popular_as?: IPopularAs,
  isAlternative = true
): IPm[] | undefined => {
  if (!pm_group) return;

  const result: IPm[] = [];

  for (const option of pm_group.options) {
    const baseCode = getOptionCode(option, pm_group?.prefix);
    const subgroup_name = (option.name && option.name.toUpperCase()) || null;
    const { id, en_name, ru_name, section, icon, color } = pm_group;

    // helper to push a PM entry
    const pushPm = (code: string) => {
      result.push({
        pm_group_id: id,
        code,
        en_name,
        ru_name,
        subgroup_name,
        currency: option?.currency,
        icon,
        color,
        popular_as: popular_as || null,
        section: section ?? "",
      });
    };

    if (baseCode) pushPm(baseCode);

    // handle alternative codes
    // if (isAlternative && option.alternative_codes) {
    //   // split by comma OR just separate codes without separator
    //   const altCodes = option.alternative_codes
    //     .split(/[,]+/) // split by comma or space
    //     .filter(Boolean); // remove empty strings
    //   for (const altCode of altCodes) {
    //     pushPm(altCode.trim().toUpperCase());
    //   }
    // }
  }

  return result.length ? result : undefined;
};

export const getPmByCode = (pmPointer: IPmPointer): IPm | undefined => {
  const { code, pm_group, popular_as } = pmPointer;
  if (!pm_group?.options) return;
  const pms = getPmsFromPmGroup(pm_group, popular_as);
  if (!pms) return;
  if (!code) return pms[0];
  return pms.find((pm) => pm.code.toLowerCase() == code.toLowerCase());
};

// export const parsePm = (pm_group: IPmGroup): IPm | null => {
//   // если одиночка
//   try{
//     // const short_name = pm_group.prefix
//     // ? pm_group.prefix.toUpperCase()
//     //   + pm_group.options[0].currency.code.toUpperCase() // not crypto
//     // : pm_group.options[0].currency.code.toUpperCase(); // crypto

//   const pm = {
//     en_name: capitalize(pm_group.en_name),
//     ru_name: capitalize(pm_group?.ru_name),
//     code: "",
//     currency: pm_group.options[0].currency,
//     icon: pm_group.icon,
//   };
//     return pm;
//   } catch(err){
//     return null
//   }

// };

// export const parseSubPm = (pm_group: IPmGroup, subitem: IOption) => ({
//   en_name: capitalize(pm_group.en_name) + " " + subitem.name,
//   ru_name: capitalize(pm_group.ru_name)
//     ? pm_group.ru_name + " " + subitem.name
//     : "",
//   short_name: subitem.short_name ? subitem.short_name.toUpperCase() : "",
//   currency: subitem.currency,
//   icon: pm_group.icon,
// });

// export const parseCurPm = (pm_group: IPmGroup, currency: ICurrency) => ({
//   en_name: capitalize(pm_group.en_name) + " " + currency.name.toUpperCase(),
//   ru_name: capitalize(pm_group.ru_name)
//     ? pm_group.ru_name + " " + currency.name.toUpperCase()
//     : "",
//   short_name: pm_group.short_name + currency.name.toUpperCase(),
//   currency,
//   icon: pm_group.icon,
// });

export const IsStringArray = (str: string) => {
  try {
    const res = JSON.parse(str);
    return Array.isArray(res);
  } catch (e) {
    return false;
  }
};

export const pmsToSlug = ({
  givePm,
  getPm,
}: {
  givePm?: IPm;
  getPm?: IPm;
}): string => {
  if (!givePm || !getPm) return "";
  const isCash =
    givePm.section.toLowerCase() == "cash" ||
    getPm.section.toLowerCase() == "cash";
  const slug = `${givePm.en_name}-${givePm.currency.code}${
    givePm.subgroup_name ? "-" + givePm.subgroup_name : ""
  }-to-${getPm.en_name}-${getPm.currency.code}${
    getPm.subgroup_name ? "-" + getPm.subgroup_name : ""
  }`;
  return slug.toLowerCase().replaceAll(" ", "").replaceAll("/", "");
};

export const slugToPms = (slug: string) => {
  if (!slug) return { givePm: null, getPm: null };

  // restore raw format
  const cleaned = slug.toLowerCase().replaceAll(" ", "").replaceAll("/", "");
  const [giveStr, getStr] = cleaned.split("-to-");
  if (!giveStr || !getStr) return { givePm: null, getPm: null };

  const parsePm = (str: string) => {
    const parts = str.split("-");
    // always at least [en_name, currency]
    if (parts.length < 2) return null;

    return {
      en_name: parts[0],
      currency: { code: parts[1] },
      subgroup_name: parts.length > 2 ? parts.slice(2).join("-") : undefined,
    };
  };

  return {
    givePm: parsePm(giveStr),
    getPm: parsePm(getStr),
  };
};

export const pmFromPmGroups = (
  name: string,
  curCode: string,
  subgroupName: string,
  pmGroups: IPmGroup[]
): IPm | undefined => {
  const pmGroup = pmGroups.filter((pmg) => {
    return (
      pmg.en_name === name &&
      pmg.options.find(
        (op) =>
          (op.name && op.name.replaceAll(" ", "") === subgroupName) ||
          op.currency.code === curCode
      )
    );
  });

  if (!pmGroup) return;
  const pms = getPmsFromPmGroup(pmGroup[0]);
  return (
    pms &&
    pms.find(
      (pm) =>
        pm.subgroup_name?.toLowerCase() === subgroupName ||
        pm.currency.code === curCode
    )
  );
};
