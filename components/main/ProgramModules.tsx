import {
  Box,
  Button,
  Divider,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { IFeatureCard, IListItem, IProgramWeek } from "../../types/pages";
import { IconType } from "react-icons";
import {
  RiAwardLine,
  RiBookOpenLine,
  RiBriefcase4Line,
  RiCalendarScheduleLine,
  RiCompass3Line,
  RiFileTextLine,
  RiFlag2Line,
  RiGlobalLine,
  RiGraduationCapLine,
  RiGroupLine,
  RiMapPin2Line,
  RiPoliceBadgeLine,
  RiSafe2Line,
  RiShieldCheckLine,
  RiTeamLine,
  RiUserStarLine,
} from "react-icons/ri";

type ProgramModulesProps = {
  programTitle?: string;
  programWeeks?: IProgramWeek[];
  reasonsTitle?: string;
  reasons?: IFeatureCard[];
  guaranteeTitle?: string;
  guarantees?: IListItem[];
  priceTitle?: string;
  priceValue?: string;
  priceNote?: string;
  priceButtonText?: string;
};

const palette = {
  wine900: "#4f1012",
  wine700: "#7e1f24",
  wine600: "#982a2f",
  wine500: "#b53a3f",
  gold500: "#d4ad63",
  gold400: "#ebcd8f",
  paper: "#f8f3eb",
  ink: "#3a2525",
};

const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(235, 205, 143, 0.0);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(235, 205, 143, 0.15);
  }
`;

const sectionShell = {
  bg: `linear-gradient(160deg, rgba(248,243,235,0.98) 0%, rgba(244,236,225,0.98) 100%)`,
  border: `1px solid rgba(181,58,63,0.35)`,
  borderRadius: "20px",
  boxShadow: "0 10px 24px rgba(79,16,18,0.12)",
  position: "relative" as const,
  overflow: "hidden" as const,
};

const sectionTitleCommon = {
  color: palette.wine700,
  fontSize: { base: "xl", md: "2xl" },
  fontWeight: 800,
  lineHeight: 1.15,
  letterSpacing: "-0.005em",
  mb: "4",
};

const normalizeIconKey = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const pickStepIcon = (icon?: string, text?: string): IconType => {
  const key = normalizeIconKey(icon);
  const hint = normalizeIconKey(text);
  if (["essay", "эссе", "memo"].includes(key) || hint.includes("эссе")) return RiFileTextLine;
  if (
    ["strategy", "стратегия", "calendar", "plan"].includes(key) ||
    hint.includes("стратег")
  )
    return RiCalendarScheduleLine;
  if (
    ["interview", "собеседование", "graduation"].includes(key) ||
    hint.includes("собесед")
  )
    return RiGraduationCapLine;
  if (["resume", "cv", "file"].includes(key) || hint.includes("резюме")) return RiBookOpenLine;
  if (["tour", "экскурсия", "university"].includes(key) || hint.includes("экскурс")) return RiMapPin2Line;
  if (["network", "нетворкинг", "team"].includes(key) || hint.includes("нетворк")) return RiTeamLine;
  if (["trip", "new_york", "travel"].includes(key) || hint.includes("нью")) return RiGlobalLine;
  return RiCompass3Line;
};

const pickReasonIcon = (icon?: string, title?: string): IconType => {
  const key = normalizeIconKey(icon);
  const hint = normalizeIconKey(title);
  if (["goal", "понимание_цели", "city"].includes(key) || hint.includes("цел")) return RiFlag2Line;
  if (
    ["portfolio", "сильное_портфолио", "cap"].includes(key) ||
    hint.includes("портфол")
  )
    return RiAwardLine;
  if (["contacts", "контакты_и_опыт", "handshake"].includes(key) || hint.includes("контакт"))
    return RiGroupLine;
  return RiUserStarLine;
};

const pickGuaranteeIcon = (icon?: string, text?: string): IconType => {
  const key = normalizeIconKey(icon);
  const hint = normalizeIconKey(text);
  if (["security", "безопасность", "shield"].includes(key) || hint.includes("безопас")) return RiShieldCheckLine;
  if (
    ["teachers", "топ-преподаватели", "mentor"].includes(key) ||
    hint.includes("преподав")
  )
    return RiBriefcase4Line;
  if (["result", "контроль_результата", "target"].includes(key) || hint.includes("результ")) return RiPoliceBadgeLine;
  return RiSafe2Line;
};

const ProgramModules = ({
  programTitle,
  programWeeks,
  reasonsTitle,
  reasons,
  guaranteeTitle,
  guarantees,
  priceTitle,
  priceValue,
  priceNote,
  priceButtonText,
}: ProgramModulesProps) => {
  const weeks = Array.isArray(programWeeks) ? programWeeks.filter((w) => w?.title) : [];
  const reasonCards = Array.isArray(reasons) ? reasons.filter((r) => r?.title) : [];
  const guaranteeItems = Array.isArray(guarantees)
    ? guarantees.filter((g) => g?.text)
    : [];

  if (!weeks.length && !reasonCards.length && !guaranteeItems.length && !priceValue) {
    return null;
  }

  return (
    <VStack spacing={{ base: 5, md: 7 }} align="stretch" mt={{ base: 8, md: 10 }}>
      {weeks.length ? (
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
                key={week.id || week.title}
                p={{ base: 3.5, md: 4 }}
                border="1px solid rgba(126,31,36,0.25)"
                borderRadius="14px"
                bg="rgba(255,255,255,0.52)"
                backdropFilter="blur(2px)"
                animation={`${riseIn} 420ms ease-out`}
                style={{ animationDelay: `${weekIndex * 80}ms` }}
              >
                <Text color={palette.wine700} fontSize={{ base: "xl", md: "2xl" }} fontWeight="800" mb="2.5">
                  {week.title}
                </Text>
                <VStack align="stretch" spacing="1.5">
                  {(week.items || []).map((item) => (
                    <HStack
                      key={item.id || `${item.icon}-${item.text}`}
                      align="start"
                      spacing="2.5"
                      py="1.25"
                      borderBottom="1px dashed rgba(126,31,36,0.18)"
                      _last={{ borderBottom: "none" }}
                    >
                      <Box
                        as={pickStepIcon(item.icon, item.text)}
                        color={palette.wine700}
                        fontSize="xl"
                        mt="0.5"
                        minW="22px"
                      />
                      <Text color={palette.ink} fontSize={{ base: "md", md: "lg" }} fontWeight="500">
                        {item.text}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {reasonCards.length ? (
        <Box {...sectionShell} p={{ base: 4, md: 6 }}>
          <Text as="h2" {...sectionTitleCommon}>
            {reasonsTitle || "Почему выбирают нас"}
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing="3">
            {reasonCards.map((reason, index) => (
              <HStack
                key={reason.id || `${reason.icon}-${reason.title}`}
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
      ) : null}

      {guaranteeItems.length ? (
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
                <Text color={palette.ink} fontSize={{ base: "md", md: "xl" }} fontWeight="700">
                  {item.text}
                </Text>
              </HStack>
            ))}
          </SimpleGrid>
        </Box>
      ) : null}

      {priceValue ? (
        <Box
          p={{ base: 4, md: 6 }}
          borderRadius="18px"
          bg={`linear-gradient(180deg, ${palette.wine600} 0%, ${palette.wine900} 100%)`}
          border={`1px solid ${palette.gold500}`}
          boxShadow="0 14px 30px rgba(79,16,18,0.3)"
          color={palette.gold400}
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 12% 10%, rgba(235,205,143,0.18), transparent 30%), radial-gradient(circle at 82% 95%, rgba(235,205,143,0.12), transparent 35%)",
            pointerEvents: "none",
          }}
        >
          <VStack spacing="3" align="center" position="relative" zIndex={1}>
            <Text
              as="h2"
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="800"
              color={palette.gold400}
              textAlign="center"
            >
              {priceTitle || "Стоимость программы"}
            </Text>
            <Text
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="800"
              color="white"
              textAlign="center"
              textShadow="0 6px 20px rgba(0,0,0,0.28)"
            >
              {priceValue}
            </Text>
            {priceNote ? (
              <Text
                textAlign="center"
                color="rgba(255,255,255,0.9)"
                fontSize={{ base: "sm", md: "md" }}
                maxW="720px"
              >
                {priceNote}
              </Text>
            ) : null}
            <Button
              bg={`linear-gradient(180deg, ${palette.gold400} 0%, ${palette.gold500} 100%)`}
              color={palette.wine900}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 10px 24px rgba(212,173,99,0.34)",
              }}
              _active={{ transform: "translateY(0)" }}
              size="md"
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="800"
              px={{ base: 6, md: 8 }}
              border={`1px solid rgba(79,16,18,0.38)`}
              borderRadius="10px"
              animation={`${pulseGlow} 2.4s ease-in-out infinite`}
            >
              {priceButtonText || "Узнать точную стоимость"}
            </Button>
          </VStack>
        </Box>
      ) : null}
    </VStack>
  );
};

export default ProgramModules;
