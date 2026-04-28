import { Box, Text } from "@chakra-ui/react";
import Link from "next/link";
import type { IUni } from "../../../types/pages";
import { Box3D } from "../../../styles/theme/custom";
import CustomImage from "../../shared/CustomImage";
import { CARD_WIDTH, IMAGE_HEIGHT } from "./constants";
import { getUniHref, truncateTo100 } from "./utils";
import { RiArrowRightLine } from "react-icons/ri";

type UniCardProps = {
  idx: number;
  uni: IUni;
};

const UniCard = ({ idx, uni }: UniCardProps) => {
  const href = getUniHref(uni);
  const title = uni.header || uni.article?.header || href || "";
  const card = (
    <Box3D
      data-uni-idx={idx}
      role="group"
      minW={CARD_WIDTH}
      maxW={CARD_WIDTH}
      overflow="hidden"
      borderRadius="xl"
      boxShadow="lg"
      flexShrink={0}
      scrollSnapAlign="center"
      scrollSnapStop="always"
      cursor={href ? "pointer" : "default"}
      _hover={href ? { filter: "brightness(1.01)" } : undefined}
    >
      <Box h="100%">
        <Box
          boxShadow="lg"
          w="100%"
          h={IMAGE_HEIGHT}
          overflow="hidden"
          position="relative"
          transition="filter 0.2s ease"
          _groupHover={href ? { filter: "brightness(0.95)" } : undefined}
        >
          <CustomImage
            img={uni.image}
            w="100%"
            h="100%"
            adaptiveQuality
            adaptiveQualityBreakpoints={{
              base: "high",
              md: "high",
            }}
            customAlt={title}
          />
          <Box
            position="absolute"
            inset={0}
            bgGradient="linear(to-t, rgba(79,16,18,0.76) 0%, rgba(79,16,18,0.05) 70%)"
          />
          <Text
            position="absolute"
            left="3"
            right="14"
            bottom="3"
            color="white"
            fontWeight="700"
            fontSize={{ base: "xl", md: "lg", lg: "xl" }}
            textShadow="0 2px 8px rgba(0,0,0,0.45)"
            noOfLines={2}
          >
            {title}
          </Text>
          <Box
            position="absolute"
            right="3"
            bottom="3"
            w="42px"
            h="42px"
            borderRadius="full"
            bgGradient="linear(135deg, #d63f45 0%, #8a1d21 100%)"
            color="white"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 10px 24px rgba(79,16,18,0.42)"
            border="1px solid #d63f45"
            transition="transform 0.2s ease, box-shadow 0.2s ease"
            _groupHover={{
              transform: "translateX(2px)",
              boxShadow: "0 12px 28px rgba(79,16,18,0.52)",
            }}
          >
            <RiArrowRightLine size="1.25rem" />
          </Box>
        </Box>
        <Box display={{ base: "none", lg: "block" }} px="3" py="3" bg="bg.100">
          <Text fontSize="sm" color="bg.800" noOfLines={2}>
            {truncateTo100(uni.subheader)}
          </Text>
        </Box>
      </Box>
    </Box3D>
  );

  if (!href) {
    return (
      <Box key={uni.id} style={{ textDecoration: "none" }}>
        {card}
      </Box>
    );
  }

  return (
    <Link
      key={uni.id}
      href={href}
      style={{ display: "block", height: "100%", textDecoration: "none" }}
    >
      {card}
    </Link>
  );
};

export default UniCard;
