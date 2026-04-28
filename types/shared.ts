export type ITone =
  | "shaded"
  | "dark"
  | "black"
  | "error"
  | "peach"
  | "violet"
  | "gray"
  | "light"
  | "white";

export type IVariant = "contrast" | "extra_contrast" | "no_contrast" | "primary";
export type ITextVariant =
  | "contrast"
  | "extra_contrast"
  | "no_contrast"
  | "shaded"
  | "red"
  | "green"
  | "primary";

export interface IFingerprint {
  ip?: string;
  fingerprint?: string;
  userAgent?: string;
}

export interface ICurrencyConverterRate {
  currentRate: number;
  giveToUSD: number;
  getToUSD: number;
  dayTrend: number;
  hourTrend: number;
}
