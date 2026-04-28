import { locale } from "../services/utils";
import { AmountInput, AmountOutputs } from "../types/amount";
import { IRate } from "../types/rates";

type CurNameEntry = {
  symbol?: string;
  ru_name: string;
  ru_name2?: string;
  ru_name3?: string;
  en_name: string;
};

const normalizeCode = (code?: string | null) =>
  typeof code === "string" ? code.trim() : "";

const getCurEntry = (code?: string | null) => {
  const raw = normalizeCode(code);
  if (!raw) return { raw: "", entry: undefined };
  const key = raw.toLowerCase() as keyof typeof curNames;
  return { raw, entry: curNames[key] };
};

export const codeToSymbol = (code?: string | null) => {
  const { entry } = getCurEntry(code);
  return entry?.symbol || code;
};

export const codeToRuName = (code?: string | null) => {
  const { raw, entry } = getCurEntry(code);
  return entry?.ru_name || raw;
};

export const codeToRuName2 = (code?: string | null) => {
  const { raw, entry } = getCurEntry(code);
  return entry?.ru_name2 || raw;
};

export const codeToRuName3 = (code?: string | null) => {
  const { raw, entry } = getCurEntry(code);
  return entry?.ru_name3 || raw;
};

export const codeToEnName = (code?: string | null) => {
  const { raw, entry } = getCurEntry(code);
  return entry?.en_name || raw;
};

export class FeesCalculator {
  rate: IRate;
  amountInput: AmountInput;
  giveCode: string;
  getCode: string;

  constructor(dir: string, rate: IRate, amountInput: AmountInput) {
    this.giveCode = dir.split("_")[0];
    this.getCode = dir.split("_")[1];
    this.rate = rate;
    this.amountInput = amountInput;
  }

  calculateAmountOutputs = (): AmountOutputs => {
    const { side, str } = this.amountInput;
    const oppositeSide = side === "get" ? "give" : "get";
    let outputs = {} as AmountOutputs;
    const calculatedAmount = this._calculateFee();

    outputs[oppositeSide] =
      calculatedAmount > 0 ? addSpaces(String(R(calculatedAmount))) : "";

    const input = Number.isNaN(+str)
      ? ""
      : str.endsWith(".") || str.endsWith("0") || str === ""
        ? str
        : String(R(+str));

    outputs[side] = addSpaces(input) || "";

    return outputs;
  };

  _calculateFee = (): number => {
    const { side, num } = this.amountInput;
    let to_fee,
      from_fee,
      course = 0;
    try {
      ({ to_fee, from_fee, course } = this.rate);
    } catch (e) {}
    if (!course || !num) return 0;
    if (side === "give") {
      if (!from_fee && !to_fee) return num / course;
      const inMinusFromFee = this._removeFromFee(num);
      return this._removeToFee(inMinusFromFee / course);
    }
    if (side === "get") {
      if (!from_fee && !to_fee) return num * course;
      const outPlusToFee = this._addToFee(num);
      return this._addFromFee(outPlusToFee * course);
    }
    return 0;
  };

  _addFromFee = (customIn: number) => {
    const { from_fee, course } = this.rate;
    if (!from_fee) return customIn;
    const [feeStr, symbol] = from_fee.split(" ");
    const fee = +feeStr;
    if (symbol && symbol === "%") return customIn / (1 - fee / 100);
    if (this.giveCode.includes(symbol)) return customIn + fee;
    if (this.getCode.includes(symbol)) return customIn + fee * course;
    return customIn;
  };

  _addToFee = (customOut: number) => {
    const { to_fee, course } = this.rate;
    if (!to_fee) return customOut;
    const [feeStr, symbol] = to_fee.split(" ");
    const fee = +feeStr;
    if (symbol && symbol === "%") return customOut / (1 - fee / 100);
    if (this.getCode.includes(symbol)) return customOut + fee;
    if (this.giveCode.includes(symbol)) return customOut + fee / course;
    return customOut;
  };

  _removeFromFee = (customIn: number) => {
    const { from_fee, course } = this.rate;
    if (!from_fee) return customIn;
    const [feeStr, symbol] = from_fee.split(" ");
    const fee = +feeStr;
    if (symbol && symbol === "%") return customIn * (1 - fee / 100);
    if (this.giveCode.includes(symbol))
      return fee > customIn ? 0 : customIn - fee;
    if (this.getCode.includes(symbol))
      return fee * course > customIn ? 0 : customIn - fee * course;
    return customIn;
  };

  _removeToFee = (customOut: number) => {
    const { to_fee, course } = this.rate;
    if (!to_fee) return customOut;
    const [feeStr, symbol] = to_fee.split(" ");
    const fee = +feeStr;
    if (symbol && symbol === "%") return customOut * (1 - fee / 100);
    if (this.getCode.includes(symbol))
      return fee > customOut ? 0 : customOut - fee;
    if (this.giveCode.includes(symbol))
      return fee / course > customOut ? 0 : customOut - fee / course;
    return customOut;
  };
}

export const kFormatter = (num: number) => {
  const abs = Math.abs(num);
  if (abs <= 1000) return num;

  return abs > 999999999
    ? "✖"
    : abs > 9999999
      ? (num / 1000000).toFixed(0) + (locale == "en" ? " m" : " млн")
      : abs > 999999
        ? (num / 1000000).toFixed(1) + (locale == "en" ? " m" : " млн")
        : abs > 9999
          ? (num / 1000).toFixed(0) + (locale == "en" ? " k" : " тыс")
          : abs > 999
            ? (num / 1000).toFixed(1) + (locale == "en" ? " k" : " тыс")
            : num.toString();
};

const stick = (num: number) => {
  if (num < 1) return num;
  let mult = 0;
  while (num % 10 === 0) {
    mult += 1;
    num /= 10;
  }

  if (num < 10) return num * 10 ** mult;
  const lastDigit = num % 10;
  if (lastDigit === 4 || lastDigit === 9) return (num + 1) * 10 ** mult;
  if (lastDigit === 6 || lastDigit === 1) return (num - 1) * 10 ** mult;
  return num * 10 ** mult;
};
export const R = (amount: number, strength = 1): number => {
  if (!amount || typeof amount !== "number" || strength >= 4) return 0;

  const s = 4 - strength;

  if (amount > 100 && s < 3) {
    const digits = amount.toFixed(0).length - 1;

    const tmp = (amount / 10 ** digits).toFixed(6 - s);
    let res = +(+tmp * 10 ** digits).toFixed(0);

    // ---- FIX FOR strength = 3 (strong rounding) ----
    if (strength === 3) {
      const magnitude = 10 ** digits;
      res = Math.ceil(amount / magnitude) * magnitude; // e.g. 885 → 1000
    }

    // ---- FIX FOR strength = 2 (softer rounding) ----
    if (strength === 2) {
      const magnitude = 10 ** (digits - 1); // one magnitude lower
      res = Math.round(amount / magnitude) * magnitude; // e.g. 885 → 900
    }

    return stick(res);
  }

  const orderOfMagnitude = -Math.floor(Math.log10(amount / 10 ** s));
  const precision = orderOfMagnitude < 0 ? 0 : orderOfMagnitude;

  return +amount.toFixed(precision);
};

export const format = (v: number, strength?: number): string => {
  return addSpaces(R(v, strength));
};

export const addSpaces = (x: string | number) => {
  const s = String(x);
  if (!x && x !== 0) return s;
  if (s.length > 9) return "✖";
  let parts = s.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return parts.join(".");
};

export const isClose = (a: number, b: number): boolean =>
  Math.abs(a - b) / a < 0.2;

export const beautifyAmount = (number: number, strength?: number) =>
  addSpaces(R(number, strength) + " ");

export const localFormat = (n: number, cur: string) => {
  const symbol = codeToSymbol(cur) || cur;
  return `${kFormatter(R(n, 1))} ${symbol}`;
};

export const curToSymbol = (cur?: string) => {
  return codeToSymbol(cur);
};

export function powerOfTenOrder(num?: number): number {
  if (!num || num === 0) return 0;

  const absoluteNum = Math.abs(num);
  const exponent = Math.floor(Math.log10(absoluteNum));

  return Math.pow(10, exponent);
}

export const curNames: Record<string, CurNameEntry> = {
  usd: {
    symbol: "$",
    ru_name: "доллары",
    ru_name2: "доллара",
    ru_name3: "доллару",
    en_name: "dollars",
  },
  rub: {
    symbol: "₽",
    ru_name: "рубли",
    ru_name2: "рубля",
    ru_name3: "рублю",
    en_name: "rubles",
  },
  uah: {
    symbol: "₴",
    ru_name: "гривны",
    ru_name2: "гривны",
    ru_name3: "гривне",
    en_name: "hryvnias",
  },
  eur: {
    symbol: "€",
    ru_name: "евро",
    ru_name2: "евро",
    ru_name3: "евро",
    en_name: "euros",
  },
  gbp: {
    symbol: "£",
    ru_name: "фунты",
    ru_name2: "фунта",
    ru_name3: "фунту",
    en_name: "pounds",
  },
  gel: {
    symbol: "₾",
    ru_name: "лари",
    ru_name2: "лари",
    ru_name3: "лари",
    en_name: "lari",
  },
  try: {
    symbol: "₺",
    ru_name: "лиры",
    ru_name2: "лиры",
    ru_name3: "лире",
    en_name: "lira",
  },
  thb: {
    symbol: "฿",
    ru_name: "баты",
    ru_name2: "бата",
    ru_name3: "бату",
    en_name: "baht",
  },
  inr: {
    symbol: "₹",
    ru_name: "рупии",
    ru_name2: "рупии",
    ru_name3: "рупии",
    en_name: "rupees",
  },
  jpy: {
    symbol: "¥",
    ru_name: "иены",
    ru_name2: "иены",
    ru_name3: "иене",
    en_name: "yen",
  },
  cny: {
    symbol: "¥",
    ru_name: "юани",
    ru_name2: "юаня",
    ru_name3: "юаню",
    en_name: "yuan",
  },
  btc: {
    ru_name: "биткоины",
    ru_name2: "биткоина",
    ru_name3: "биткоину",
    en_name: "bitcoins",
  },
  eth: {
    ru_name: "эфиры",
    ru_name2: "эфира",
    ru_name3: "эфиру",
    en_name: "ether",
  },
  usdt: {
    ru_name: "тезеры",
    ru_name2: "тезера",
    ru_name3: "тезеру",
    en_name: "tethers",
  },
  usdc: {
    ru_name: "юсдс",
    ru_name2: "юсдс",
    ru_name3: "юсдс",
    en_name: "usd coin",
  },
  bnb: {
    ru_name: "биэнби",
    ru_name2: "биэнби",
    ru_name3: "биэнби",
    en_name: "bnb",
  },
  xrp: {
    ru_name: "рипплы",
    ru_name2: "риппла",
    ru_name3: "рипплу",
    en_name: "ripple",
  },
  ada: {
    ru_name: "кардано",
    ru_name2: "кардано",
    ru_name3: "кардано",
    en_name: "cardano",
  },
  sol: {
    ru_name: "соланы",
    ru_name2: "соланы",
    ru_name3: "солане",
    en_name: "solana",
  },
  dot: {
    ru_name: "полкадоты",
    ru_name2: "полкадота",
    ru_name3: "полкадоту",
    en_name: "polkadot",
  },
  doge: {
    ru_name: "доджкоины",
    ru_name2: "доджкоина",
    ru_name3: "доджкоину",
    en_name: "dogecoin",
  },
  ltc: {
    ru_name: "лайткоины",
    ru_name2: "лайткоина",
    ru_name3: "лайткоину",
    en_name: "litecoin",
  },
  trx: {
    ru_name: "троны",
    ru_name2: "трона",
    ru_name3: "трону",
    en_name: "tron",
  },
  ton: {
    ru_name: "тоны",
    ru_name2: "тона",
    ru_name3: "тону",
    en_name: "ton",
  },
};
