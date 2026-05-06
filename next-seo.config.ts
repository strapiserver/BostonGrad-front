export const defaultConfig = {
  title: "BostonGrad | Летние образовательные программы в США",
  description:
    "Летние программы в Бостоне и Нью-Йорке для школьников и абитуриентов: кампусы, академическая среда, стратегия поступления и сопровождение.",
  additionalMetaTags: [
    {
      property: "og:image",
      content: "https://bostongrad.com/logoLQ.png",
    },
    {
      property: "og:image:width",
      content: "200",
    },
    {
      property: "og:image:height",
      content: "200",
    },
  ],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://bostongrad.com",
    site_name: "BostonGrad",
    images: [
      {
        url: "https://bostongrad.com/logoLQ.png",
        width: 200,
        height: 200,
        alt: "BostonGrad",
      },
    ],
  },
  twitter: {
    site: "BostonGrad",
    cardType: "summary_large_image",
    image: "https://bostongrad.com/logoLQ.png",
  },
};
