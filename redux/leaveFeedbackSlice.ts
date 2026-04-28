import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type SentimentValue = "positive" | "neutral" | "negative" | null;

export type ReviewForm = {
  value: string;
  honeypot: string;
  hasSubmitted: boolean;
  isSending: boolean;
  sentiment: SentimentValue;
  isExchangeDone: boolean | null;
  gossip: string;
  cooldownUntil: number | null;
  shouldSubmitAfterModal: boolean;
  selectedCategoryIds: string[];
};

export type LeaveFeedbackState = {
  reviewByExchanger: Record<string, ReviewForm>;
  replyText: string;
};

const emptyReviewForm: ReviewForm = {
  value: "",
  honeypot: "",
  hasSubmitted: false,
  isSending: false,
  sentiment: null,
  isExchangeDone: null,
  gossip: "",
  cooldownUntil: null,
  shouldSubmitAfterModal: false,
  selectedCategoryIds: [],
};

const ensureReviewForm = (
  state: LeaveFeedbackState,
  exchangerId: string
): ReviewForm => {
  if (!state.reviewByExchanger[exchangerId]) {
    state.reviewByExchanger[exchangerId] = { ...emptyReviewForm };
  }
  return state.reviewByExchanger[exchangerId];
};

const leaveFeedbackSlice = createSlice({
  name: "leaveFeedback",
  initialState: {
    reviewByExchanger: {},
    replyText: "",
  } as LeaveFeedbackState,
  reducers: {
    setReviewValue: (
      state,
      action: PayloadAction<{ exchangerId: string; value: string }>
    ) => {
      ensureReviewForm(state, action.payload.exchangerId).value =
        action.payload.value;
    },
    setReviewHoneypot: (
      state,
      action: PayloadAction<{ exchangerId: string; honeypot: string }>
    ) => {
      ensureReviewForm(state, action.payload.exchangerId).honeypot =
        action.payload.honeypot;
    },
    setReviewHasSubmitted: (
      state,
      action: PayloadAction<{ exchangerId: string; hasSubmitted: boolean }>
    ) => {
      ensureReviewForm(state, action.payload.exchangerId).hasSubmitted =
        action.payload.hasSubmitted;
    },
    setReviewIsSending: (
      state,
      action: PayloadAction<{ exchangerId: string; isSending: boolean }>
    ) => {
      ensureReviewForm(state, action.payload.exchangerId).isSending =
        action.payload.isSending;
    },
    setReviewSentiment: (
      state,
      action: PayloadAction<{ exchangerId: string; sentiment: SentimentValue }>
    ) => {
      ensureReviewForm(state, action.payload.exchangerId).sentiment =
        action.payload.sentiment;
    },
    setReviewIsExchangeDone: (
      state,
      action: PayloadAction<{
        exchangerId: string;
        isExchangeDone: boolean | null;
      }>
    ) => {
      ensureReviewForm(state, action.payload.exchangerId).isExchangeDone =
        action.payload.isExchangeDone;
    },
    setReviewGossip: (
      state,
      action: PayloadAction<{ exchangerId: string; gossip: string }>
    ) => {
      ensureReviewForm(state, action.payload.exchangerId).gossip =
        action.payload.gossip;
    },
    setReviewCooldownUntil: (
      state,
      action: PayloadAction<{
        exchangerId: string;
        cooldownUntil: number | null;
      }>
    ) => {
      ensureReviewForm(state, action.payload.exchangerId).cooldownUntil =
        action.payload.cooldownUntil;
    },
    setReviewShouldSubmitAfterModal: (
      state,
      action: PayloadAction<{ exchangerId: string; shouldSubmit: boolean }>
    ) => {
      ensureReviewForm(
        state,
        action.payload.exchangerId
      ).shouldSubmitAfterModal = action.payload.shouldSubmit;
    },
    toggleReviewCategory: (
      state,
      action: PayloadAction<{ exchangerId: string; categoryId: string }>
    ) => {
      const form = ensureReviewForm(state, action.payload.exchangerId);
      const exists = form.selectedCategoryIds.includes(
        action.payload.categoryId
      );
      form.selectedCategoryIds = exists
        ? form.selectedCategoryIds.filter(
            (id) => id !== action.payload.categoryId
          )
        : [...form.selectedCategoryIds, action.payload.categoryId];
    },
    setReviewCategories: (
      state,
      action: PayloadAction<{ exchangerId: string; categories: string[] }>
    ) => {
      ensureReviewForm(state, action.payload.exchangerId).selectedCategoryIds =
        action.payload.categories;
    },
    resetReviewForm: (
      state,
      action: PayloadAction<{ exchangerId: string }>
    ) => {
      state.reviewByExchanger[action.payload.exchangerId] = {
        ...emptyReviewForm,
      };
    },
    setReplyText: (state, action: PayloadAction<string>) => {
      state.replyText = action.payload;
    },
    resetReplyText: (state) => {
      state.replyText = "";
    },
  },
});

export const {
  setReviewValue,
  setReviewHoneypot,
  setReviewHasSubmitted,
  setReviewIsSending,
  setReviewSentiment,
  setReviewIsExchangeDone,
  setReviewGossip,
  setReviewCooldownUntil,
  setReviewShouldSubmitAfterModal,
  toggleReviewCategory,
  setReviewCategories,
  resetReviewForm,
  setReplyText,
  resetReplyText,
} = leaveFeedbackSlice.actions;

export const selectReviewForm = (state: RootState, exchangerId: string) =>
  state.leaveFeedback.reviewByExchanger[exchangerId] || emptyReviewForm;

export const selectReplyText = (state: RootState) =>
  state.leaveFeedback.replyText;

export default leaveFeedbackSlice.reducer;
