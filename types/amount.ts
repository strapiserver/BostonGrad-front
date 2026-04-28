export type AmountInput = {
  side: "give" | "get";
  num: number;
  str: string;
};

export type AmountOutputs = {
  give: string;
  get: string;
};
