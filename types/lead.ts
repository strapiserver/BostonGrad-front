export type LeadStatus =
  | "not_verified"
  | "new"
  | "awaiting_call"
  | "interested"
  | "ready"
  | "paid"
  | "visa_done"
  | "finished"
  | "canceled"
  | string;

export type LeadQuestion = {
  id: string;
  name: string;
  text: string;
  stage: number | null;
  isBoolean: boolean;
  isOptional: boolean;
  options: string[];
};

export type LeadResponse = {
  id: string;
  answer: string;
  question: LeadQuestion | null;
};

export type LeadCountry = {
  id: string;
  name: string;
};

export type LeadContact = {
  id: string;
  user_id: string;
  username: string;
  isBanned: boolean;
  isCallForbidden: boolean;
  socialnetworkName: string;
};

export type LeadItem = {
  id: string;
  name: string;
  status: LeadStatus;
  kid_age: number | null;
  country: LeadCountry | null;
  userAgent: string;
  admin_comment: string;
  createdAt: string;
  responses: LeadResponse[];
  lead_contacts: LeadContact[];
};

export type CountryOption = {
  id: string;
  name: string;
};

export type LeadDraft = {
  name: string;
  status: LeadStatus;
  kid_age: string;
  countryId: string;
  userAgent: string;
  admin_comment: string;
};
