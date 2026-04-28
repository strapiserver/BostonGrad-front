import { Box, HStack, Text } from "@chakra-ui/react";
import React from "react";

export default function AdvantageBottom({
  hovering,
  title,
  subtitle,
  icon,
}: {
  hovering: boolean;
  title: string;
  subtitle: string;
  icon: any;
}) {
  return (
    <HStack
      gap="4"
      color={hovering ? "violet.500" : "bg.200"}
      px="4"
      mt="-8"
      mb="4"
    >
      {icon}
      <Box>
        <Text fontSize="lg">{title}</Text>
        <Text fontSize="sm" color="bg.700">
          {subtitle}
        </Text>
      </Box>
    </HStack>
  );
}
