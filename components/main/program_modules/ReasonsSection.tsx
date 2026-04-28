import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import {
  palette,
  pickReasonIcon,
  riseIn,
  sectionShell,
  sectionTitleCommon,
} from "./shared";

type ReasonsSectionProps = {
  reasonsTitle?: string;
};

const ReasonsSection = ({ reasonsTitle }: ReasonsSectionProps) => {
  const reasonCards = [
    {
      title: "Понятная стратегия",
      subtitle:
        "Ребенок узнает, какие шаги нужны для поступления: профиль, активности, английский, эссе и дедлайны.",
      icon: "strategy",
    },
    {
      title: "Безопасный формат",
      subtitle:
        "Группа сопровождается на протяжении программы, а родители получают связь и обновления.",
      icon: "security",
    },
    {
      title: "Реальный опыт Бостона",
      subtitle:
        "Участники видят университетскую среду, кампусы, студентов и город сильных вузов.",
      icon: "city",
    },
    {
      title: "Следующие шаги",
      subtitle:
        "После программы ребенок понимает, что делать дальше для поступления.",
      icon: "target",
    },
  ];

  return (
    <Box {...sectionShell} p={{ base: 4, md: 6 }}>
      <Text as="h2" {...sectionTitleCommon}>
        {reasonsTitle || "Почему родители выбирают БостонГрад"}
      </Text>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing="3">
        {reasonCards.map((reason, index) => (
          <HStack
            key={`${reason.icon}-${reason.title}`}
            p="4"
            borderRadius="14px"
            border="1px solid rgba(126,31,36,0.24)"
            bg="linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(252,246,237,0.88) 100%)"
            spacing="3"
            minH={{ base: "auto", md: "112px" }}
            align="center"
            transition="all 200ms ease"
            animation={`${riseIn} 420ms ease-out`}
            style={{ animationDelay: `${index * 90}ms` }}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 8px 18px rgba(79,16,18,0.16)",
              borderColor: "rgba(181,58,63,0.42)",
            }}
          >
            <Box
              minW="42px"
              h="42px"
              borderRadius="12px"
              bg="rgba(126,31,36,0.1)"
              border="1px solid rgba(126,31,36,0.2)"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Box
                as={pickReasonIcon(reason.icon, reason.title)}
                color={palette.wine700}
                fontSize="2xl"
                lineHeight="1"
              />
            </Box>
            <VStack align="start" spacing="0.5" flex="1">
              <Text
                color={palette.wine700}
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="800"
                lineHeight="1.15"
              >
                {reason.title}
              </Text>
              {reason.subtitle ? (
                <Text color={palette.ink} fontSize="sm" opacity={0.9}>
                  {reason.subtitle}
                </Text>
              ) : null}
            </VStack>
            <Text
              color="rgba(126,31,36,0.4)"
              fontSize="xs"
              fontWeight="700"
              alignSelf="flex-start"
              mt="0.5"
            >
              0{index + 1}
            </Text>
          </HStack>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ReasonsSection;
