import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import {
  palette,
  pickStepIcon,
  riseIn,
  sectionShell,
  sectionTitleCommon,
} from "./shared";

type ProgramWeeksSectionProps = {
  programTitle?: string;
};

const ProgramWeeksSection = ({
  programTitle,
}: ProgramWeeksSectionProps) => {
  const weeks = [
    {
      title: "Неделя 1 - интенсив по поступлению",
      items: [
        "День 1: приезд, знакомство, ориентация и правила безопасности",
        "День 2: как устроено поступление в США",
        "День 3: выбор специальности и карьерного направления",
        "День 4: внеучебные активности, портфолио и проекты",
        "День 5: эссе, рекомендации и стратегия подачи",
        "День 6: индивидуальный мини-план для каждого участника",
        "День 7: культурная программа по Бостону",
      ],
    },
    {
      title: "Неделя 2 - кампусы и Нью-Йорк",
      items: [
        "День 8: Harvard + Cambridge",
        "День 9: MIT + инновационная среда",
        "День 10: Boston University / Northeastern",
        "День 11: Boston College / дополнительные кампусы",
        "День 12: поездка в Нью-Йорк",
        "День 13: Нью-Йорк - кампусы, культура и городская среда",
        "День 14: финальная встреча, отчет и выезд",
      ],
    },
  ];

  return (
    <Box
      {...sectionShell}
      p={{ base: 4, md: 6 }}
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bg: `radial-gradient(circle at 10% 10%, rgba(181,58,63,0.08), transparent 35%), radial-gradient(circle at 85% 20%, rgba(212,173,99,0.14), transparent 30%)`,
        pointerEvents: "none",
      }}
    >
      <Text as="h2" {...sectionTitleCommon}>
        {programTitle || "Программа на 2 недели"}
      </Text>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="3">
        {weeks.map((week, weekIndex) => (
          <Box
            key={week.title}
            p={{ base: 3.5, md: 4 }}
            border="1px solid rgba(126,31,36,0.25)"
            borderRadius="14px"
            bg="rgba(255,255,255,0.52)"
            backdropFilter="blur(2px)"
            animation={`${riseIn} 420ms ease-out`}
            style={{ animationDelay: `${weekIndex * 80}ms` }}
          >
            <Text
              color={palette.wine700}
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="800"
              mb="2.5"
            >
              {week.title}
            </Text>
            <VStack align="stretch" spacing="1.5">
              {week.items.map((item) => (
                <HStack
                  key={item}
                  align="start"
                  spacing="2.5"
                  py="1.25"
                  borderBottom="1px dashed rgba(126,31,36,0.18)"
                    _last={{ borderBottom: "none" }}
                >
                  <Box
                    as={pickStepIcon(undefined, item)}
                    color={palette.wine700}
                    fontSize="xl"
                    mt="0.5"
                    minW="22px"
                  />
                  <Text
                    color={palette.ink}
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="500"
                  >
                    {item}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default ProgramWeeksSection;
