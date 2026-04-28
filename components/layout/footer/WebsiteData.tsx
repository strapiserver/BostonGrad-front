import React from "react";
import logoLQ from "../../../public/logoLQ.png";
import { HStack, Text, Image } from "@chakra-ui/react";
import { base } from "../../../services/utils";

export default function WebsiteData() {
  const websiteDomain = base || "bostongrad.com";

  return (
    <HStack mt="8">
      <Image
        w="40px"
        h="40px"
        src={logoLQ.src || ""}
        alt="BostonGrad"
      />
      <HStack gap="2" alignItems="center">
        <Text fontSize="xl" color="bg.700">
          {websiteDomain}
        </Text>
        <Text fontSize="sm" color="bg.800" mt="1">
          • 2026
        </Text>
      </HStack>
    </HStack>
  );
}
