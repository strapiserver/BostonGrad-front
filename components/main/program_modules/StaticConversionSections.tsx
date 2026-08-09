import {
  Box,
  Button,
  HStack,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  RiChat3Line,
  RiCheckboxCircleLine,
  RiFileList3Line,
  RiFlag2Line,
  RiMapPin2Line,
  RiParentLine,
  RiRoadMapLine,
  RiShieldCheckLine,
  RiStarLine,
  RiTeamLine,
  RiTimeLine,
} from "react-icons/ri";
import { palette, sectionShell, sectionTitleCommon } from "./shared";
import { fbqTrackCustom } from "../../../services/metaPixel";

const cardBg =
  "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(252,246,237,0.94) 100%)";

const SectionCard = ({
  icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) => (
  <VStack
    align="start"
    spacing="3"
    p="4"
    borderRadius="14px"
    border="1px solid rgba(126,31,36,0.18)"
    bg={cardBg}
    h="100%"
  >
    <HStack align="center" spacing="2.5">
      <Box
        as={icon}
        color={palette.wine700}
        fontSize="xl"
        lineHeight="1"
        flexShrink={0}
      />
      <Text
        color={palette.wine700}
        fontSize={{ base: "lg", md: "lg" }}
        fontWeight="800"
        lineHeight="1.18"
      >
        {title}
      </Text>
    </HStack>
    <Text color={palette.ink} fontSize="md" lineHeight="1.55">
      {text}
    </Text>
  </VStack>
);

export const ParentsSection = () => (
  <Box {...sectionShell} p={{ base: 4, md: 6 }}>
    <Text as="h2" {...sectionTitleCommon}>
      Для родителей, которые хотят подготовить ребенка к поступлению в США
    </Text>
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing="3">
      <SectionCard
        icon={RiParentLine}
        title="Ребенку 14-16 лет"
        text="Он еще выбирает направление, страну и университетский путь. Программа помогает увидеть обучение в США изнутри и понять, какие шаги начинать заранее."
      />
      <SectionCard
        icon={RiTimeLine}
        title="Ребенку 16-18 лет"
        text="Пора думать о профиле, внеучебных активностях, эссе, тестах, выборе вузов и сроках. Участник собирает понятную стратегию подготовки."
      />
      <SectionCard
        icon={RiFlag2Line}
        title="Есть цель, но нет плана"
        text="Мы показываем не только кампусы, но и реальную систему поступления: академический профиль, активности, портфолио, сроки и требования."
      />
    </SimpleGrid>
  </Box>
);

export const OutcomesSection = () => (
  <Box {...sectionShell} p={{ base: 4, md: 6 }}>
    <Text as="h2" {...sectionTitleCommon}>
      Что ребенок увезет с собой после программы
    </Text>
    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing="3">
      <SectionCard
        icon={RiFileList3Line}
        title="Понимание поступления"
        text="Как выбираются университеты, какие документы нужны и что важно кроме оценок."
      />
      <SectionCard
        icon={RiRoadMapLine}
        title="План поступления"
        text="Следующие шаги на 6-18 месяцев: академический профиль, английский, активности, проекты и тесты."
      />
      <SectionCard
        icon={RiMapPin2Line}
        title="Опыт кампусов"
        text="Harvard, MIT, BU, BC, Northeastern и другие университетские среды Бостона."
      />
      <SectionCard
        icon={RiStarLine}
        title="Мотивация и цель"
        text="После личного опыта ребенку проще понять, зачем учиться и какой уровень нужно держать."
      />
      <SectionCard
        icon={RiTeamLine}
        title="Англоязычная среда"
        text="Безопасный формат, где подросток учится общаться, ориентироваться и думать о будущем."
      />
      <SectionCard
        icon={RiChat3Line}
        title="Понятность для родителей"
        text="Родители получают более ясную картину: что делать дальше и какие вопросы решать заранее."
      />
    </SimpleGrid>
  </Box>
);

export const BostonValueSection = () => (
  <Box {...sectionShell} p="0">
    <Box
      position="relative"
      w="100%"
      minH={{ base: "220px", md: "320px" }}
      overflow="hidden"
    >
      <Box
        as="img"
        src="/uploads/boston_51aa37b450.jpg"
        alt="Бостон"
        w="100%"
        h="100%"
        minH={{ base: "220px", md: "320px" }}
        objectFit="cover"
        display="block"
      />
      <Box
        position="absolute"
        inset="0"
        bg="linear-gradient(0deg, rgba(79,16,18,0.62) 0%, rgba(79,16,18,0.34) 42%, rgba(79,16,18,0.08) 100%)"
      />
      <Text
        as="h2"
        position="absolute"
        left={{ base: 5, md: 8 }}
        bottom={{ base: 5, md: 7 }}
        color="#f6d894"
        fontSize={{ base: "3xl", md: "6xl" }}
        fontWeight="900"
        lineHeight="1.05"
        textShadow="0 2px 0 rgba(70,20,20,0.5), 0 8px 18px rgba(0,0,0,0.45)"
      >
        Погружение в ритм жизни Бостона и Кембриджа
      </Text>
    </Box>
    <Text
      color={palette.ink}
      fontSize={{ base: "md", md: "lg" }}
      p={{ base: 5, md: 6 }}
      lineHeight="1.65"
    >
      Бостон — это образовательная столица мира, и мы знаем, как открыть её
      двери для вашего ребенка.За две недели мы погружаем участников в
      уникальную экосистему знаний. Это не просто экскурсия и курсы по
      поступлению , а тест-драйв будущего. Мы покажем контрасты, которые
      формируют выбор: от закрытых кампусов «Лиги плюща» до ультрасовременных
      технологических хабов и динамичных городских университетов.Разные среды
      диктуют разный темп жизни и обучения. Мы помогаем ребенку не просто
      увидеть вузы, а «примерить» их на себя, чтобы понять: где он станет
      лидером, а не просто студентом.Инвестируйте в осознанный выбор. Начните
      путь в топовые университеты США с экспертами, которые живут в эпицентре
      инноваций.
    </Text>
  </Box>
);

export const NewYorkValueSection = () => (
  <Box {...sectionShell} p="0">
    <Box
      position="relative"
      w="100%"
      minH={{ base: "220px", md: "320px" }}
      overflow="hidden"
    >
      <Box
        as="img"
        src="/uploads/ny_03ce208133.jpg"
        alt="Нью-Йорк"
        w="100%"
        h="100%"
        minH={{ base: "220px", md: "320px" }}
        objectFit="cover"
        display="block"
      />
      <Box
        position="absolute"
        inset="0"
        bg="linear-gradient(0deg, rgba(79,16,18,0.62) 0%, rgba(79,16,18,0.34) 42%, rgba(79,16,18,0.08) 100%)"
      />
      <Text
        as="h2"
        position="absolute"
        left={{ base: 5, md: 8 }}
        bottom={{ base: 5, md: 7 }}
        color="#f6d894"
        fontSize={{ base: "3xl", md: "6xl" }}
        fontWeight="900"
        lineHeight="1.05"
        textShadow="0 2px 0 rgba(70,20,20,0.5), 0 8px 18px rgba(0,0,0,0.45)"
      >
        Изучение университетов Boston, New Heaven и New-York
      </Text>
    </Box>
    <Text
      color={palette.ink}
      fontSize={{ base: "md", md: "lg" }}
      p={{ base: 5, md: 6 }}
      lineHeight="1.65"
    >
      Нью-Йорк как учебная аудитория: почувствуйте ритм успеха. Один день в
      Большом Яблоке, который изменит представление об учебе. Мы покажем жизнь
      студента в самом центре мировых событий: от тихих библиотек до кипящих
      энергией кампусов. Это шанс примерить на себя роль амбициозного жителя
      мегаполиса и понять: готов ли ваш ребенок покорять столицу мира?
    </Text>
  </Box>
);

export const SafetySection = () => (
  <Box {...sectionShell} p={{ base: 4, md: 6 }}>
    <Text as="h2" {...sectionTitleCommon}>
      Безопасность и сопровождение
    </Text>
    <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing="3">
      <SectionCard
        icon={RiShieldCheckLine}
        title="Сопровождение на месте"
        text="Кураторы находятся с группой во время программы, перемещений и экскурсий."
      />
      <SectionCard
        icon={RiCheckboxCircleLine}
        title="Контроль проживания"
        text="Понятное размещение, правила проживания и заранее проверенные условия."
      />
      <SectionCard
        icon={RiChat3Line}
        title="Связь с родителями"
        text="Регулярные обновления и контакт для срочных вопросов во время программы."
      />
      <SectionCard
        icon={RiRoadMapLine}
        title="Организованный маршрут"
        text="Транспорт и перемещения планируются заранее, участники не остаются одни."
      />
    </SimpleGrid>
  </Box>
);

export const NotTourSection = () => (
  <Box {...sectionShell} p={{ base: 4, md: 6 }}>
    <Text
      as="h2"
      color={palette.wine700}
      fontSize={{ base: "2xl", md: "4xl" }}
      fontWeight="900"
      textAlign="center"
      lineHeight="1.12"
      mb="5"
    >
      Это не туристическая поездка. Это первая стратегическая встреча ребенка с
      американским образованием.
    </Text>
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="3">
      <VStack
        align="stretch"
        spacing="2"
        p="4"
        borderRadius="14px"
        bg="rgba(255,255,255,0.62)"
        border="1px solid rgba(126,31,36,0.14)"
      >
        <Text color={palette.wine700} fontWeight="900">
          Обычный тур
        </Text>
        <Text color={palette.ink}>
          Посмотреть города и кампусы без стратегии.
        </Text>
        <Text color={palette.ink}>Нет образовательного результата.</Text>
        <Text color={palette.ink}>
          Родителям сложно понять ценность поездки.
        </Text>
      </VStack>
      <VStack
        align="stretch"
        spacing="2"
        p="4"
        borderRadius="14px"
        bg="rgba(126,31,36,0.08)"
        border="1px solid rgba(126,31,36,0.24)"
      >
        <Text color={palette.wine700} fontWeight="900">
          БостонГрад
        </Text>
        <Text color={palette.ink}>
          Интенсив по поступлению и опыт кампусов.
        </Text>
        <Text color={palette.ink}>
          Ребенок уезжает с планом и следующими шагами.
        </Text>
        <Text color={palette.ink}>
          Родители понимают, зачем это нужно для поступления.
        </Text>
      </VStack>
    </SimpleGrid>
  </Box>
);

export const FaqSection = () => (
  <Box {...sectionShell} p={{ base: 4, md: 6 }}>
    <Text as="h2" {...sectionTitleCommon}>
      Частые вопросы родителей
    </Text>
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing="3">
      {[
        [
          "Это официальная программа Harvard или MIT?",
          "Нет. Мы организуем посещения кампусов и стратегию поступления в Бостоне, не обещая обучение от имени университетов.",
        ],
        [
          "Какой возраст подходит?",
          "Основной фокус - школьники и абитуриенты 14-18 лет.",
        ],
        [
          "Нужен ли высокий английский?",
          "Достаточно уровня, чтобы участвовать в поездке и практиковаться. Детали обсуждаются на консультации.",
        ],
        [
          "Что с визой и перелетом?",
          "Мы объясняем процесс и требования, но финальные условия зависят от страны проживания и дат поездки.",
        ],
      ].map(([question, answer]) => (
        <Box
          key={question}
          p="4"
          borderRadius="14px"
          bg={cardBg}
          border="1px solid rgba(126,31,36,0.18)"
        >
          <Text color={palette.wine700} fontWeight="900" fontSize="lg">
            {question}
          </Text>
          <Text color={palette.ink} mt="2" lineHeight="1.55">
            {answer}
          </Text>
        </Box>
      ))}
    </SimpleGrid>
  </Box>
);

export const FinalCtaIntro = () => (
  <VStack align="stretch" spacing="2" mb="5">
    <Text
      color="#f6d894"
      fontSize={{ base: "2xl", md: "4xl" }}
      fontWeight="900"
      lineHeight="1.12"
    >
      Хотите понять, подходит ли программа вашему ребенку?
    </Text>
    <Text
      color="rgba(255,255,255,0.88)"
      fontSize={{ base: "md", md: "lg" }}
      lineHeight="1.6"
    >
      Оставьте заявку - мы отправим PDF-программу, даты, стоимость и ответим на
      вопросы по проживанию, визе, перелету и безопасности.
    </Text>
    <Button
      as="a"
      href="#lead-form"
      onClick={() =>
        fbqTrackCustom("ClickProgram", {
          source: "final_cta",
          label: "Получить программу",
        })
      }
      alignSelf="start"
      mt="2"
      bg={`linear-gradient(180deg, ${palette.gold400} 0%, ${palette.gold500} 100%)`}
      color={palette.wine900}
      fontWeight="900"
      borderRadius="10px"
      _hover={{ transform: "translateY(-2px)" }}
    >
      Получить программу
    </Button>
  </VStack>
);
