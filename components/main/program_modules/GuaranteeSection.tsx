import { Box, Divider, HStack, SimpleGrid, Text } from "@chakra-ui/react";
import { IListItem } from "../../../types/pages";
import { palette, pickGuaranteeIcon, sectionShell } from "./shared";

type GuaranteeSectionProps = {
  guaranteeTitle?: string;
  guarantees?: IListItem[];
};

const GuaranteeSection = ({
  guaranteeTitle,
  guarantees,
}: GuaranteeSectionProps) => {
  const guaranteeItems = Array.isArray(guarantees)
    ? guarantees.filter((item) => item?.text)
    : [];
  if (!guaranteeItems.length) return null;

  return (
    <Box {...sectionShell} p={{ base: 4, md: 6 }}>
      <Text
        as="h2"
        color={palette.wine700}
        fontSize={{ base: "2xl", md: "4xl" }}
        fontWeight="800"
        textAlign="center"
        lineHeight="1.15"
        letterSpacing="-0.01em"
      >
        {guaranteeTitle || "Мы не продаем тур. Мы готовим к поступлению."}
      </Text>
      <Divider my="4" borderColor="rgba(126,31,36,0.2)" />
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing="3">
        {guaranteeItems.map((item) => (
          <HStack
            key={item.id || `${item.icon}-${item.text}`}
            justify="center"
            spacing="2.5"
            p="2.5"
            borderRadius="12px"
            bg="rgba(255,255,255,0.55)"
            border="1px solid rgba(126,31,36,0.16)"
          >
            <Box
              as={pickGuaranteeIcon(item.icon, item.text)}
              color={palette.wine700}
              fontSize="xl"
              lineHeight="1"
            />
            <Text
              color={palette.ink}
              fontSize={{ base: "md", md: "xl" }}
              fontWeight="700"
            >
              {item.text}
            </Text>
          </HStack>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default GuaranteeSection;
