import { Box, HStack, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { palette, riseIn, sectionTitleCommon } from "./shared";

type ProgramWeeksSectionProps = {
  programTitle?: string;
};

const ProgramWeeksSection = ({ programTitle }: ProgramWeeksSectionProps) => {
  const weeks = [
    {
      title: "Первая неделя",
      subtitle: "входит в оба формата",
      items: [],
    },
    {
      title: "Вторая неделя",
      subtitle: "дополнительно к базовому пакету",
      items: [],
    },
  ];

  return (
    <Box
      p={{ base: 3, md: 4 }}
      borderRadius="22px"
      border="1px solid rgba(212,173,99,0.3)"
      bg="linear-gradient(150deg, #7a1d22 0%, #5c1519 100%)"
      boxShadow="0 14px 30px rgba(42,8,10,0.35)"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        bg: `radial-gradient(circle at 8% 8%, rgba(255,255,255,0.08), transparent 32%), radial-gradient(circle at 92% 14%, rgba(212,173,99,0.16), transparent 30%)`,
        pointerEvents: "none",
      }}
    >
      <Text
        as="h2"
        {...sectionTitleCommon}
        color={palette.paper}
        textShadow="0 1px 8px rgba(0,0,0,0.28)"
      >
        {programTitle || "Программа на 2 недели"}
      </Text>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing="4">
        {weeks.map((week, weekIndex) => (
          <Box
            key={week.title}
            p={{ base: 3.5, md: 4 }}
            border="1px solid rgba(212,173,99,0.26)"
            borderRadius="18px"
            bg="rgba(130,32,38,0.62)"
            animation={`${riseIn} 420ms ease-out`}
            style={{ animationDelay: `${weekIndex * 80}ms` }}
          >
            <HStack spacing="3" align="start" mb="3">
              <Box
                minW="30px"
                h="30px"
                borderRadius="full"
                bg={palette.gold400}
                color={palette.wine900}
                fontWeight="900"
                fontSize="md"
                display="flex"
                alignItems="center"
                justifyContent="center"
                mt="0.5"
              >
                {weekIndex + 1}
              </Box>
              <VStack align="start" spacing="0">
                <Text
                  color={palette.paper}
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="800"
                  lineHeight="1.05"
                >
                  {week.title}
                </Text>
                <Text
                  color="rgba(248,243,235,0.74)"
                  fontSize={{ base: "sm", md: "md" }}
                >
                  {week.subtitle}
                </Text>
              </VStack>
            </HStack>
            <VStack align="stretch" spacing="2.5">
              {week.items.map((item, itemIndex) => (
                <HStack
                  key={`${week.title}-${itemIndex}`}
                  align="center"
                  spacing="2.5"
                  py="2.5"
                  px="3"
                  borderRadius="12px"
                  bg="rgba(112,24,29,0.68)"
                >
                  <Box
                    minW="8px"
                    h="8px"
                    borderRadius="full"
                    bg={palette.gold400}
                  />
                  <Text
                    color={palette.paper}
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="500"
                    lineHeight="1.25"
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
