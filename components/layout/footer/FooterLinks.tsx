import { VStack, Link, Text } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { ResponsiveText } from "../../../styles/theme/custom";

type FooterLink = { label: string; href: string };

export default function FooterLinks({
  links,
  title,
}: {
  links: FooterLink[];
  title: string;
}) {
  return (
    <VStack alignItems="flex-start" spacing="2">
      <ResponsiveText variant="contrast" size="md">
        {title}
      </ResponsiveText>
      {links.map((link) => (
        <Link
          as={NextLink}
          key={link.href + link.label}
          href={link.href}
          color="bg.700"
          _hover={{ color: "bg.500" }}
          fontSize="sm"
        >
          {link.label}
        </Link>
      ))}
    </VStack>
  );
}
