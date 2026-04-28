import { isCashPm } from "../components/shared/helper";
import { AmountInput, AmountOutputs } from "../types/amount";
import { IPm } from "../types/selector";

import { IFingerprint } from "../types/shared";
import { FeesCalculator } from "./amountsHelper";
import { MainState } from "./mainReducer";

export const initialAmountOutputs = { give: "", get: "" };

export const [minDef, maxDef, minStart, minEnd, maxStart, maxEnd, rateSpread] =
  [300, 5000, 100, 5000, 100, 10000, 0.1]; // EQUAL TO USD

const initialAmount = (side: "give" | "get", toUSD?: number) => ({
  num: 1,
  str: "1",
  side: side,
});
export const getAmountOutputs = (
  state: MainState,
  swiperIdVisible: number,
  customAmount?: AmountInput,
  preserveInputSide?: boolean
): AmountOutputs => {
  const dir = `${state.givePm?.code.toUpperCase()}_${state.getPm?.code.toUpperCase()}`;
  // updateAmounts не успевает подхватить swiperIdVisible, поэтому передаем дополнительно
  const rate = state?.dirRates?.[swiperIdVisible];
  const side = rate && rate?.course > 1 ? "get" : "give";
  const amount =
    customAmount ||
    state.amountInput ||
    initialAmount(side, state.ccRates?.[`${side}ToUSD`]);
  if (rate) {
    const feesCalculator = new FeesCalculator(dir, rate, amount);
    const outputs = feesCalculator.calculateAmountOutputs();
    if (preserveInputSide && amount?.side) {
      outputs[amount.side] =
        state.amountOutputs?.[amount.side] || outputs[amount.side];
    }
    return outputs;
  }
  return initialAmountOutputs;
};

export const createUID = (fingerprint?: IFingerprint) => {
  const ip = fingerprint?.ip;
  if (!ip) return "uid_unknown";
  return "uid_" + Number(ip.replaceAll(".", "")).toString(36);
};

export const destructureDirSlug = (slug: string) => {
  const [giveNameCurCode, getNameCurCode] = slug.split("-to-");
  const [giveName, giveCurCode, giveSubgroupName] = giveNameCurCode.split("-");
  const [getName, getCurCode, getSubgroupName] = getNameCurCode.split("-");
  return {
    giveName,
    giveCurCode,
    giveSubgroupName,
    getName,
    getCurCode,
    getSubgroupName,
  };
};
//
export const enrichLink = ({
  refLink,
  givePm,
  getPm,
  cityCode,
}: {
  refLink: string | undefined | null;
  givePm?: IPm;
  getPm?: IPm;
  cityCode?: any;
}) => {
  if (!refLink) return "";
  if (!givePm || !getPm) return refLink;
  const isCash = isCashPm(givePm) || isCashPm(getPm);

  // Avoid double slashes and duplicate separators when appending params
  const normalizedRefLink = refLink.replace(/\/+$/, "");
  const hasQuery = normalizedRefLink.includes("?");
  const joiner =
    normalizedRefLink.endsWith("?") || normalizedRefLink.endsWith("&")
      ? ""
      : hasQuery
      ? "&"
      : "?";

  return `${normalizedRefLink}${joiner}cur_from=${givePm.code}&cur_to=${
    getPm.code
  }${isCash && cityCode ? `&city=${cityCode.toUpperCase()}` : ""}`;
};
