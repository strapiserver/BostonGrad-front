import { Html, Head, Main, NextScript } from "next/document";

const yandexMetrikaId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "";
const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || "";

export default function MyDocument() {
  return (
    <Html lang="ru">
      <Head>
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="48x48"
          href="/favicon-48x48.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        {/* Preconnect for font performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* Optimized fonts with normal, semibold, and bold weights */}
        <link
          href="https://fonts.googleapis.com/css2?family=Mozilla+Text:wght@400;700&text=-0123456789.,&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;600;700&family=Montserrat:wght@300;600;700&family=Arvo:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {yandexMetrikaId ? (
          <>
            {/* Yandex Metrika */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function(m,e,t,r,i,k,a){
                      m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                      m[i].l=1*new Date();
                      for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                  })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${encodeURIComponent(yandexMetrikaId)}', 'ym');

                  ym(${JSON.stringify(yandexMetrikaId)}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
                `,
              }}
            />
          </>
        ) : null}

        {googleAnalyticsId ? (
          <>
            {/* Google Analytics */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
                googleAnalyticsId,
              )}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', ${JSON.stringify(googleAnalyticsId)});
                `,
              }}
            />
          </>
        ) : null}
      </Head>
      <body>
        <Main />
        {yandexMetrikaId ? (
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<div><img src="https://mc.yandex.ru/watch/${encodeURIComponent(
                yandexMetrikaId,
              )}" style="position:absolute;left:-9999px" alt="" /></div>`,
            }}
          />
        ) : null}
        <NextScript />
        {/* <script src="//code.jivosite.com/widget/SuEyiBBWCg" async></script> */}
      </body>
    </Html>
  );
}
