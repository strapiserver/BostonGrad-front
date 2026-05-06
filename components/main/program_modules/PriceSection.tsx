import {
  Box,
  Button,
  Grid,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  RiArrowRightLine,
  RiBookOpenLine,
  RiBus2Line,
  RiCalendarCheckLine,
  RiFileList3Line,
  RiGlobalLine,
  RiHome4Line,
  RiInformationLine,
  RiLightbulbFlashLine,
  RiTeamLine,
  RiUserStarLine,
} from "react-icons/ri";
import { palette } from "./shared";
import { fbqTrackCustom } from "../../../services/metaPixel";

type PriceSectionProps = {
  priceTitle?: string;
  priceButtonText?: string;
};

const oneWeekIncluded = [
  "Поездка в Boston, New Heaven и New-York",
  "Встречи с сотрудниками и студентами университетов",
  "Проживание в двухместных номерах",
  "Полное сопровождение",
  "Культурная программа и экскурсии",
];
const twoWeekExtras = [
  "Все из первой недели",
  "Тренировка сдачи SAT и TOEFL",
  "Тренировка написания эссе",
  "Изучение стипендий и грантов",
  "Изучение систем подачи документов",
];

const pickWeekItemIcon = (text: string) => {
  const value = String(text || "").toLowerCase();
  if (value.includes("индивидуаль")) return RiUserStarLine;
  if (value.includes("практичес")) return RiLightbulbFlashLine;
  if (value.includes("проживание")) return RiHome4Line;
  if (value.includes("транспорт")) return RiBus2Line;
  if (value.includes("сопровожд")) return RiTeamLine;
  if (value.includes("все из первой")) return RiBookOpenLine;
  if (value.includes("расширен")) return RiCalendarCheckLine;
  if (value.includes("нью-йорк")) return RiGlobalLine;
  if (value.includes("план") || value.includes("отчет")) return RiFileList3Line;
  return RiInformationLine;
};

const priceCards = [
  {
    title: "Недельная программа",
    subtitle: "Погружение в университеты",
    price: "$5800",
  },
  {
    title: "Двухнедельная программа",
    subtitle: "Включает неделю обучения",
    price: "$7800",
  },
];

const PriceSection = ({ priceTitle, priceButtonText }: PriceSectionProps) => {
  const scrollToPageEnd = () => {
    fbqTrackCustom("ClickApply", {
      source: "price_section",
      label: priceButtonText || "Узнать точную стоимость",
    });

    if (typeof window === "undefined") return;
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <Box
      px={{ base: 4, md: 7 }}
      py={{ base: 5, md: 7 }}
      borderRadius={{ base: "18px", md: "22px" }}
      bg={`radial-gradient(circle at 74% 8%, rgba(235,205,143,0.08), transparent 24%), linear-gradient(145deg, #5a2426 0%, #4a1e1f 46%, #3b1718 100%)`}
      border={`1px solid rgba(235,205,143,0.42)`}
      boxShadow="0 22px 44px rgba(40,12,13,0.36)"
      color={palette.gold400}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 24%), radial-gradient(circle at 88% 16%, rgba(255,255,255,0.1), transparent 18%)",
        pointerEvents: "none",
      }}
    >
      <VStack
        align="stretch"
        spacing={{ base: 5, md: 7 }}
        position="relative"
        zIndex={1}
      >
        <Grid
          gap={{ base: 5, md: 7 }}
          alignItems="stretch"
          templateColumns={{
            base: "1fr",
            lg: "minmax(0, 0.82fr) minmax(520px, 1.18fr)",
          }}
        >
          <VStack
            spacing="4"
            align={{ base: "center", md: "start" }}
            justify="center"
          >
            <Text
              as="h2"
              fontSize={{ base: "3xl", md: "4xl", xl: "5xl" }}
              fontWeight="900"
              color="#f7e0ae"
              textAlign={{ base: "center", md: "left" }}
              lineHeight="1.04"
              textShadow="0 8px 24px rgba(0,0,0,0.24)"
            >
              {priceTitle || "Стоимость программы"}
            </Text>
            <Button
              type="button"
              onClick={scrollToPageEnd}
              w={{ base: "100%", sm: "auto" }}
              minW={{ md: "320px" }}
              minH="54px"
              bg={`linear-gradient(180deg, #f4d998 0%, ${palette.gold500} 100%)`}
              color={palette.wine900}
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 12px 28px rgba(212,173,99,0.35)",
              }}
              _active={{ transform: "translateY(0)" }}
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="900"
              px={{ base: 4, md: 6 }}
              border="2px solid rgba(79,16,18,0.45)"
              borderRadius="14px"
              rightIcon={<RiArrowRightLine />}
            >
              {priceButtonText || "Узнать точную стоимость"}
            </Button>
          </VStack>

          <SimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing="4"
            alignItems="stretch"
          >
            {priceCards.map((card) => (
              <Box
                key={card.title}
                position="relative"
                p={{ base: 3, md: 2 }}
                minH={{ base: "150px", md: "165px" }}
                borderRadius="16px"
                border="1px solid rgba(235,205,143,0.52)"
                bg="linear-gradient(180deg, rgba(74,30,31,0.92) 0%, rgba(58,23,24,0.94) 100%)"
                boxShadow="inset 0 1px 0 rgba(255,255,255,0.14)"
                h="100%"
              >
                <VStack spacing="2.5" h="100%" justify="center">
                  <VStack spacing="1">
                    <Text
                      color="#fff1c9"
                      fontSize={{ base: "xl", md: "2xl", xl: "3xl" }}
                      fontWeight="900"
                      lineHeight="1"
                      textAlign="center"
                    >
                      {card.title}
                    </Text>
                    <Text
                      color="rgba(255,255,255,0.9)"
                      fontSize={{ base: "xs", md: "sm" }}
                      lineHeight="1.45"
                      textAlign="center"
                    >
                      {card.subtitle}
                    </Text>
                  </VStack>
                  <Box w="100%" h="1px" bg="rgba(235,205,143,0.24)" />
                  <HStack align="baseline" justify="center" spacing="2">
                    <Text
                      color={palette.gold400}
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="900"
                    >
                      от
                    </Text>
                    <Text
                      color="#fff1c9"
                      fontSize={{ base: "3xl", md: "4xl", xl: "5xl" }}
                      fontWeight="900"
                      lineHeight="0.95"
                      textShadow="0 8px 28px rgba(235,205,143,0.22)"
                      whiteSpace="nowrap"
                    >
                      {card.price}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </Grid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
          {[
            ["Первая неделя", "входит в оба формата", oneWeekIncluded],
            ["Вторая неделя", "дополнительно к базовому пакету", twoWeekExtras],
          ].map(([title, subtitle, items], index) => (
            <Box
              key={title as string}
              p={{ base: 4, md: 5 }}
              borderRadius="16px"
              border="1px solid rgba(235,205,143,0.2)"
              bg="rgba(74,30,31,0.5)"
              boxShadow="inset 0 1px 0 rgba(255,255,255,0.08)"
              h="100%"
            >
              <HStack spacing="3" mb="4" align="center">
                <Box
                  w="28px"
                  h="28px"
                  borderRadius="full"
                  bg="rgba(235,205,143,0.96)"
                  color={palette.wine700}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Text fontSize="sm" fontWeight="900" lineHeight="1">
                    {index + 1}
                  </Text>
                </Box>
                <Box>
                  <Text
                    color="#f7e0ae"
                    fontWeight="900"
                    fontSize={{ base: "lg", md: "xl" }}
                    lineHeight="1.2"
                  >
                    {title as string}
                  </Text>
                  <Text color="rgba(255,255,255,0.64)" fontSize="sm" mt="0.5">
                    {subtitle as string}
                  </Text>
                </Box>
              </HStack>
              <VStack align="stretch" spacing="2">
                {(items as string[]).map((item) => (
                  <HStack
                    key={item}
                    align="center"
                    spacing="2.5"
                    px="3"
                    py="2.5"
                    borderRadius="10px"
                    bg="rgba(58,23,24,0.72)"
                  >
                    <Box
                      as={pickWeekItemIcon(item)}
                      color={palette.gold400}
                      fontSize="lg"
                      flexShrink={0}
                    />
                    <Text
                      color="rgba(255,255,255,0.92)"
                      fontSize={{ base: "sm", md: "md" }}
                      lineHeight="1.45"
                    >
                      {item}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          ))}
        </SimpleGrid>

        <HStack
          spacing="3"
          pt="3"
          borderTop="1px solid rgba(235,205,143,0.24)"
          color="rgba(255,255,255,0.76)"
          align="center"
        >
          <Box
            as={RiInformationLine}
            color={palette.gold400}
            fontSize="xl"
            flexShrink={0}
          />
          <Text fontSize={{ base: "xs", md: "sm" }} lineHeight="1.5">
            Точная стоимость рассчитывается индивидуально под даты поездки и
            выбранный формат участия.
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default PriceSection;
