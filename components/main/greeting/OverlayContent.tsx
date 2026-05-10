import { Box, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { CountryOption, SocialNetworkItem } from "../../../services/cmsPublic";
import { IMainBenefit } from "../../../types/pages";
import Benefits from "./Benefits";
import Forms from "../form";

export default function OverlayContent({
  title,
  subtitle,
  contentOffsetTop,
  benefits,
  countries,
  socialNetworks,
}: {
  title?: string;
  subtitle?: string;
  contentOffsetTop?: { base: number; md: string; lg: string };
  benefits?: IMainBenefit[];
  countries?: CountryOption[];
  socialNetworks?: SocialNetworkItem[];
}) {
  return (
    <Box
      position={{ base: "relative", md: "absolute" }}
      top={{ base: "0", md: "16" }}
      bottom={{ base: "auto", md: "0" }}
      left={0}
      w={{ base: "100%", md: "52vw" }}
      pr={{ base: "0", md: "120px" }}
      minW={{ base: "0", md: "760px" }}
      zIndex="3"
      bg={{
        base: "linear-gradient(165deg, #5b1f1f 0%, #431616 100%)",
        md: "rgba(61, 17, 17, 0.8)",
      }}
      clipPath={{ base: "none", md: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
      borderTopRadius={{ base: "0", md: "0" }}
      borderTop={{ base: "1px solid rgba(255,210,130,0.5)", md: "none" }}
      borderRight={{ base: "1px solid rgba(255,255,255,0.1)", md: "none" }}
      boxShadow={{
        base: "0 -10px 28px rgba(0,0,0,0.35), 0 20px 45px rgba(0,0,0,0.2)",
        md: "none",
      }}
      backdropFilter={{ base: "blur(6px)", md: "none" }}
      color="white"
      fontSize={{ base: "md", md: "2xl" }}
      fontWeight="bold"
      textTransform="none"
      letterSpacing="normal"
      pointerEvents="auto"
      px={{ base: "7", md: "7" }}
      py={{ base: "8", md: "9" }}
      pt={contentOffsetTop}
      overflowY={{ base: "visible", md: "auto" }}
    >
      <Box w={{ base: "100%", md: "88%" }}>
        <Box
          h="2px"
          w="100%"
          bgGradient="linear(to-r, transparent 0%, rgba(246,216,148,0.2) 32%, rgba(255,226,150,0.95) 50%, rgba(246,216,148,0.2) 68%, transparent 100%)"
          mb={{ base: "5", md: "4" }}
          position="relative"
          opacity={0.95}
          _after={{
            content: '""',
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translateX(-50%)",
            w: "10px",
            h: "10px",
            borderRadius: "full",
            bg: "radial-gradient(circle, #ffe7a8 0%, #f6d894 58%, rgba(246,216,148,0) 100%)",
            boxShadow: "0 0 14px rgba(246,216,148,0.65)",
            marginTop: "-5px",
          }}
          _before={{
            content: '""',
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            w: "56px",
            h: "14px",
            borderRadius: "full",
            bg: "radial-gradient(ellipse, rgba(246,216,148,0.55) 0%, rgba(246,216,148,0.18) 45%, rgba(246,216,148,0) 100%)",
          }}
        />
        <VStack align="stretch" spacing={{ base: "8", md: "7" }}>
          <Text
            textAlign="left"
            color="#f6d894"
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
            fontWeight="800"
            lineHeight={{ base: "1.1", md: "1.06" }}
            letterSpacing={{ base: "0.015em", md: "0.01em" }}
            textTransform="uppercase"
            textShadow="0 2px 0 rgba(70,20,20,0.5), 0 8px 18px rgba(0,0,0,0.45)"
            display={{ base: "none", md: "block" }}
          >
            {title}
            {title ? (
              <Box
                as="img"
                src="/flag.jpg"
                alt=""
                display="inline-block"
                w={{ md: "36px", lg: "41px" }}
                h={{ md: "24px", lg: "27px" }}
                ml="3"
                mb="1"
                borderRadius="0"
                objectFit="cover"
                verticalAlign="middle"
                boxShadow="0 4px 12px rgba(0,0,0,0.22)"
              />
            ) : null}
          </Text>
          <Text
            textAlign="left"
            whiteSpace="normal"
            color="rgba(255,255,255,0.94)"
            fontSize={{ base: "lg", md: "xl", lg: "xl" }}
            fontWeight="400"
            lineHeight={{ base: "1.35", md: "1.25" }}
            letterSpacing={{ base: "0.025em", md: "0.02em" }}
            textTransform="uppercase"
            textShadow="0 1px 8px rgba(0,0,0,0.35)"
            display={{ base: "none", md: "block" }}
          >
            {subtitle}
          </Text>
          <Benefits benefits={benefits} />
          <Forms
            countries={countries || []}
            socialNetworks={socialNetworks || []}
          />
        </VStack>
      </Box>
    </Box>
  );
}
