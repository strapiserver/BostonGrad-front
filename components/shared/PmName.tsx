import { Box, HStack, useColorModeValue, VStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../styles/theme/custom";
import { IPm } from "../../types/selector";
import CircularIcon from "./CircularIcon";
import { getPmNameFromPm } from "./helper";

const PmName = ({
  pm,
  isFull = true,
  isTwoLines = false,
  isHighlited = false,
}: {
  pm?: IPm;
  isFull?: boolean;
  isTwoLines?: boolean;
  isHighlited?: boolean;
}) => {
  if (!pm) return <></>;

  const color = isHighlited
    ? useColorModeValue("violet.600", "violet.600")
    : useColorModeValue("bg.700", "bg.200");

  const name = getPmNameFromPm(pm);
  const shortName = getPmNameFromPm(pm, true);

  return (
    <HStack gap="2" color={color}>
      <CircularIcon
        iconAlt={pm.en_name}
        icon={pm.icon}
        color={pm.color || "gray"}
      />

      {isTwoLines ? (
        <VStack spacing={0} align="start">
          <ResponsiveText size="sm" color={color} fontWeight="semibold">
            {pm.currency.code?.toUpperCase()}
          </ResponsiveText>
          <ResponsiveText size="xs" color={color}>
            {shortName}
          </ResponsiveText>
        </VStack>
      ) : (
        <Box position="relative" mt="0.5">
          <ResponsiveText>{name}</ResponsiveText>
        </Box>
      )}
    </HStack>
  );
};

export default PmName;
