import React from "react";
import logoLQ from "../../../public/logoLQ.png";
import { HStack, Text, Image, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { base } from "../../../services/utils";
import { useI18n } from "../../../services/i18n";

export default function WebsiteData() {
  const { t } = useI18n();
  const websiteDomain = base || "bostongrad.com";

  return (
    <HStack
      mt="8"
      w="100%"
      justifyContent="space-between"
      alignItems={{ base: "flex-start", md: "center" }}
      flexDir={{ base: "column", md: "row" }}
      gap="4"
    >
      <HStack>
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
      <Link
        as={NextLink}
        href="/confidential-policy"
        fontSize="sm"
        color="bg.700"
        _hover={{ color: "bg.500" }}
      >
        {t("Политика конфиденциальности")}
      </Link>
    </HStack>
  );
}
