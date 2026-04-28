import Transliterator from "../../services/transliterator";
import { IExchanger, IParserExchanger } from "../../types/exchanger";
import { IArticle } from "../../types/pages";
import { IPm } from "../../types/selector";

import { enrichText } from "../shared/helper";

export function exchangerNameToSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "") // ✅ underscore is preserved
    .replace(/\s+/g, "_") // spaces -> underscore
    .replace(/_+/g, "_")
    .replace(/-+/g, "-");
}

export function exchangerSlugToName(slug: string): string {
  return slug
    .trim()
    .replace(/_/g, " ") // underscores -> spaces
    .split(/[\s-]/) // split words on both spaces and dashes
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(matchSpacing(slug)); // rejoin with original separators
}

// helper to restore separators
function matchSpacing(slug: string): string {
  // If original had dash(s), keep dash separation
  if (slug.includes("-") && !slug.includes("_")) {
    return "-";
  }
  return " ";
}

export const getStatus = (exchanger: IExchanger) => {
  if (exchanger.status !== "active") {
    return "orange";
  }

  return "green";
};

export const addExchangerCrossLinking = async (
  exchanger: IExchanger | null,
  articleCodes: string[] | undefined,
  pms: IPm[] | undefined
) => {
  const card = exchanger?.exchanger_card || null;
  const ruText = card?.text?.trim() || card?.ru_description;
  if (
    !articleCodes ||
    !exchanger ||
    !card ||
    !card.en_description ||
    !ruText
  )
    return exchanger;

  const seen = new Set<string>();
  const text = enrichText({
    seen,
    text: ruText,
    articleCodes,
    pms,
  });

  card.text = text;

  return exchanger;
};
