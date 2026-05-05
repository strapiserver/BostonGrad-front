type Fbq = (...args: unknown[]) => void;

export type MetaPixelParams = Record<string, unknown>;

type MetaPixelCall = {
  method: "track" | "trackCustom";
  eventName: string;
  params?: MetaPixelParams;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
    __metaPixelQueue?: MetaPixelCall[];
  }
}

const getQueue = () => {
  window.__metaPixelQueue = window.__metaPixelQueue || [];
  return window.__metaPixelQueue;
};

export const flushMetaPixelQueue = () => {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  const queue = getQueue().splice(0);
  queue.forEach(({ method, eventName, params }) => {
    if (params) {
      window.fbq?.(method, eventName, params);
      return;
    }
    window.fbq?.(method, eventName);
  });
};

const callFbq = (
  method: "track" | "trackCustom",
  eventName: string,
  params?: MetaPixelParams,
) => {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.fbq !== "function") {
    getQueue().push({ method, eventName, params });
    return;
  }

  flushMetaPixelQueue();

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
