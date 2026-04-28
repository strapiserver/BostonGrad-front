import { Box, Text, HStack } from "@chakra-ui/react";
import React from "react";
import { FaStar } from "react-icons/fa";
import { ResponsiveText } from "../../../styles/theme/custom";

export default function Rating({ rating }: { rating?: number | null }) {
  if (!rating) return <></>;

  const ratingColor =
    rating < 3
      ? "red.500"
      : rating < 4
      ? "orange.500"
      : rating < 4.5
      ? "yellow.600"
      : rating < 4.7
      ? "#97bb48"
      : "green.400";
  return (
    <HStack gap="1" alignItems="center">
      <Box color={ratingColor}>
        <FaStar size="0.8rem" />
      </Box>
      <Text fontSize="sm" color={ratingColor} mt="0.5">
        {rating}
      </Text>
    </HStack>
  );
}
