type Fbq = (...args: unknown[]) => void;

export type MetaPixelParams = Record<string, unknown>;

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

const callFbq = (
  method: "track" | "trackCustom",
  eventName: string,
  params?: MetaPixelParams,
) => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  if (params) {
    window.fbq(method, eventName, params);
    return;
  }

  window.fbq(method, eventName);
};

export const fbqTrack = (eventName: string, params?: MetaPixelParams) => {
  callFbq("track", eventName, params);
};

export const fbqTrackCustom = (
  eventName: string,
  params?: MetaPixelParams,
) => {
  callFbq("trackCustom", eventName, params);
};
