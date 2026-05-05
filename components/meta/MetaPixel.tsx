import { useEffect } from "react";
import { useRouter } from "next/router";
import Script from "next/script";
import { fbqTrack } from "../../services/metaPixel";

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || "";

export default function MetaPixel() {
  const router = useRouter();

  useEffect(() => {
    if (!metaPixelId) return;

    const handleRouteChange = () => {
      fbqTrack("PageView");
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  if (!metaPixelId) return null;

  const noscriptSrc = `https://www.facebook.com/tr?id=${encodeURIComponent(
    metaPixelId,
  )}&ev=PageView&noscript=1`;

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', ${JSON.stringify(metaPixelId)});
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<img height="1" width="1" style="display:none" src="${noscriptSrc}" alt="" />`,
        }}
      />
    </>
  );
}
