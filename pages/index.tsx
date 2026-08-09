import MainPageContent from "../components/main";
import UniversalSeo, { nullSeo } from "../components/shared/UniversalSeo";
import { ISEO } from "../types/general";
import { Box } from "@chakra-ui/react";
import gridPattern from "../public/grid.png";
import { staticContent } from "../services/staticContent";

export const getStaticProps = async () => {
  const {
    mainSingle,
    unis,
    products,
    stories,
    visa,
    realPicture,
    countries,
    socialNetworks,
  } = staticContent;
  const seo: ISEO = {
    title: mainSingle?.seo_title || mainSingle?.title || "Главная",
    description:
      mainSingle?.seo_subtitle || mainSingle?.subtitle || "Главная страница",
    canonicalSlug: "",
  };

  return {
    props: {
      seo: seo || nullSeo,
      mainSingle,
      unis,
      products,
      stories,
      visa,
      realPicture,
      countries,
      socialNetworks,
      popularPms: [],
      popularRates: null,
      mainTexts: [],
      rootText: null,
      reviews: [],
    },
  };
};

const Home = (props: any) => {
  return (
    <>
      <UniversalSeo seo={props.seo} />
      <Box position="relative" w="100%">
        <Box
          position="absolute"
          top="1%"
          left="50%"
          transform="translateX(-50%)"
          w="100vw"
          filter={{ base: "opacity(0.5)", lg: "opacity(0.3)" }}
          zIndex={0}
          pointerEvents="none"
        >
          <Box
            as="img"
            src={gridPattern.src}
            alt="Grid background pattern"
            w="100vw"
            h="auto"
          />
        </Box>
        <MainPageContent {...props} />
      </Box>
    </>
  );
};

export default Home;
