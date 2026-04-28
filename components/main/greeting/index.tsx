import { VStack, Box, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { cmsLinkPROD, cmsLinkDEV } from "../../../services/utils";
import { IMainSingle } from "../../../types/pages";
import { IImage } from "../../../types/selector";
import OverlayContent from "./OverlayContent";

type SocialNetworkItem = {
  name: string;
  icon: IImage | null;
  url: string;
};
type CountryOption = {
  id: string;
  name: string;
};

export default function GreetingImage({
  mainSingle,
  countries,
  socialNetworks,
}: {
  mainSingle: IMainSingle;
  countries: CountryOption[];
  socialNetworks: SocialNetworkItem[];
}) {
  const ambientColor = useColorModeValue(
    "rgba(243, 71, 71, 0.2)",
    "rgba(247, 197, 177, 0.1)",
  );
  const env = process.env.NODE_ENV;
  const CMS_SRC = env === "production" ? cmsLinkPROD : cmsLinkDEV;

  const resolveMediaUrl = (url?: string | null) => {
    if (!url) return "";
    return url.startsWith("http") ? url : `${CMS_SRC}${url}`;
  };
  const mediaShiftTop = {
    base: 0,
    md: "-250px",
    lg: "-350px",
  } as const;
  const overlayContentOffsetTop = {
    base: 0,
    md: "250px",
    lg: "350px",
  } as const;

  return (
    <VStack
      align="stretch"
      spacing="3"
      width={{ base: "100%", md: "100vw" }}
      position="relative"
      left={{ base: "0", md: "50%" }}
      right={{ base: "0", md: "50%" }}
      ml={{ base: "0", md: "-50vw" }}
      mr={{ base: "0", md: "-50vw" }}
    >
      <Box position="relative" zIndex="1" w="100%">
        {mainSingle.image ? (
          <Box position="relative" w="100%" overflow="hidden">
            <Box position="relative" mt={mediaShiftTop}>
              <Box
                as="img"
                src={resolveMediaUrl(mainSingle.image.url)}
                alt={mainSingle.title || "Main image"}
                w="100%"
                h="auto"
                display="block"
                pointerEvents="none"
                userSelect="none"
              />
              <Box
                position="absolute"
                inset={0}
                zIndex="1"
                pointerEvents="none"
                bgGradient={`radial-gradient(ellipse at 50% -10%, ${ambientColor} 10%, transparent 50%)`}
              />
              <Box
                display={{ base: "block", md: "none" }}
                position="absolute"
                inset={0}
                zIndex="2"
                pointerEvents="none"
                bgGradient="linear(to-b, rgba(64,20,20,0.55) 0%, rgba(64,20,20,0.15) 28%, transparent 48%)"
              >
                <Box
                  w="100%"
                  h="1px"
                  mt="4"
                  bgGradient="linear(to-r, transparent 0%, rgba(246,216,148,0.85) 50%, transparent 100%)"
                />
                <Text
                  px="6"
                  pt="7"
                  color="#f6d894"
                  fontSize="4xl"
                  fontWeight="800"
                  lineHeight="1.04"
                  textTransform="uppercase"
                  textShadow="0 2px 0 rgba(70,20,20,0.45), 0 8px 18px rgba(0,0,0,0.45)"
                >
                  {mainSingle.title}
                </Text>
                <Text
                  px="6"
                  pt="2"
                  color="rgba(255,255,255,0.95)"
                  fontSize="lg"
                  fontWeight="500"
                  letterSpacing="0.02em"
                  textTransform="uppercase"
                  textShadow="0 1px 8px rgba(0,0,0,0.35)"
                >
                  {mainSingle.subtitle}
                  {mainSingle.subtitle ? (
                    <Box
                      as="img"
                      src="/flag.jpg"
                      alt=""
                      display="inline-block"
                      w="26px"
                      h="16px"
                      ml="1"
                      borderRadius="0"
                      objectFit="cover"
                      verticalAlign="middle"
                      boxShadow="0 3px 10px rgba(0,0,0,0.24)"
                    />
                  ) : null}
                </Text>
              </Box>
              <OverlayContent
                title={mainSingle.title}
                subtitle={mainSingle.subtitle}
                contentOffsetTop={overlayContentOffsetTop}
                benefits={mainSingle.benefit}
                countries={countries}
                socialNetworks={socialNetworks}
              />
            </Box>
          </Box>
        ) : null}
      </Box>
    </VStack>
  );
}
