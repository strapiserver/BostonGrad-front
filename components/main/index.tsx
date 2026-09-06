import React, { useEffect } from "react";
import { VStack, Box } from "@chakra-ui/react";
import { useAppDispatch } from "../../redux/hooks";
import { clean } from "../../redux/mainReducer";
import { useRouter } from "next/router";
import {
  IMainSingle,
  IProduct,
  IRealPicture,
  IStory,
  IUni,
  IVisa,
} from "../../types/pages";
import CustomTitle from "../shared/CustomTitle";
import UniPreview from "./uni_preview";
import GreetingImage from "./greeting";
import { CountryOption, SocialNetworkItem } from "../../services/cmsPublic";
import MockStoryline from "./mockStoryline";
import SummerInvite from "./summer_invite";
import RealPictureSection from "./real_picture";
import Forms from "./form";
import Products from "../products";
import Connection from "./Connection";
import {
  BostonValueSection,
  FaqSection,
  NewYorkValueSection,
  PriceSection,
  ReasonsSection,
} from "./program_modules";
import { useI18n, useLocalizedContent } from "../../services/i18n";

const MainPageContent = ({
  unis,
  mainSingle,
  countries,
  socialNetworks,
  stories,
  products,
  visa,
  realPicture,
}: {
  unis?: IUni[] | null;
  mainSingle?: IMainSingle | null;
  countries?: CountryOption[] | null;
  socialNetworks?: SocialNetworkItem[] | null;
  stories?: IStory[] | null;
  products?: IProduct[] | null;
  visa?: IVisa | null;
  realPicture?: IRealPicture | null;
}) => {
  const { t } = useI18n();
  const localizedMain = useLocalizedContent(mainSingle);
  const localizedUnis = useLocalizedContent(unis);
  const localizedCountries = useLocalizedContent(countries);
  const localizedStories = useLocalizedContent(stories);
  const localizedProducts = useLocalizedContent(products);
  const localizedVisa = useLocalizedContent(visa);
  const localizedPicture = useLocalizedContent(realPicture);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { slug } = router.query;

  useEffect(() => {
    if (!slug) {
      dispatch(clean());
    }
  }, [slug, dispatch]);

  return (
    <VStack align="stretch" w="100%">
      {localizedMain ? (
        <GreetingImage
          mainSingle={localizedMain}
          countries={localizedCountries || []}
          socialNetworks={socialNetworks || []}
        />
      ) : null}

      <Box
        id="universities"
        mt={{ base: "0", md: "-100" }}
        position="relative"
        zIndex={4}
      >
        <UniPreview unis={localizedUnis} />
      </Box>

      <Box id="programs">
        <CustomTitle as="h2" title={t("Что входит в программу")} />
      </Box>
      <Box id="products">
        <Products products={localizedProducts || []} />
      </Box>
      <Box id="real-picture">
        <RealPictureSection realPicture={localizedPicture} />
      </Box>

      <Box id="summer-invite" mt={{ base: "2", md: "4" }}>
        <SummerInvite visa={localizedVisa} />
      </Box>

      <Box id="program-modules">
        <VStack
          spacing={{ base: 5, md: 7 }}
          align="stretch"
          mt={{ base: 8, md: 10 }}
        >
          <PriceSection
            priceTitle={localizedMain?.price_title}
            priceButtonText={localizedMain?.price_button_text}
          />
          <ReasonsSection reasonsTitle={localizedMain?.reasons_title} />
          <Connection socialNetworks={socialNetworks || []} />
          <BostonValueSection />
          <NewYorkValueSection />

          <FaqSection />
        </VStack>
      </Box>

      {/* <Box id="stories" mt={{ base: "8", md: "12" }}>
        <MockStoryline stories={stories || []} />
      </Box> */}

      <Box
        id="lead-form"
        w="100%"
        mt={{ base: "10", md: "14" }}
        px={{ base: "4", md: "8" }}
        py={{ base: "8", md: "10" }}
        bg="linear-gradient(165deg, #5b1f1f 0%, #431616 100%)"
        borderTop="1px solid rgba(255,210,130,0.5)"
      >
        <Forms
          title={t("Получите PDF-программу и консультацию по датам")}
          countries={localizedCountries || []}
          socialNetworks={socialNetworks || []}
        />
      </Box>
    </VStack>
  );
};

export default MainPageContent;
