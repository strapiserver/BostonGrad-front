import {
  Box,
  Container,
  HStack,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { IArticle } from "../../../types/pages";
import { TextToHTML } from "../../shared/helper";
import { ISEO } from "../../../types/general";
import UniversalSeo from "../../shared/UniversalSeo";
import { RiArrowRightSLine, RiCalendarEventLine } from "react-icons/ri";
import ArticleStats from "./ArticleStats";
import Forms from "../../main/form";
import { IImage } from "../../../types/selector";

type SocialNetworkItem = {
  name: string;
  icon: IImage | null;
  url: string;
};

type CountryOption = {
  id: string;
  name: string;
};

export default function GeneralArticle({
  article,
  seo,
  countries,
  socialNetworks,
}: {
  article: IArticle | null;
  seo: ISEO;
  countries?: CountryOption[] | null;
  socialNetworks?: SocialNetworkItem[] | null;
}) {
  const frameBg = useColorModeValue(
    "linear-gradient(180deg, #fbf8f2 0%, #f4ede3 100%)",
    "linear-gradient(180deg, #1f1616 0%, #171010 100%)",
  );
  const cardBg = useColorModeValue(
    "rgba(255,255,255,0.86)",
    "rgba(32,24,24,0.9)",
  );
  const titleColor = useColorModeValue("#711f24", "#f0d19a");
  const subtitleColor = useColorModeValue(
    "rgba(50,30,30,0.85)",
    "rgba(240,220,180,0.85)",
  );
  const bodyTextColor = useColorModeValue("#2f2424", "#e7dbce");
  const quoteBg = useColorModeValue(
    "rgba(138,36,43,0.07)",
    "rgba(240,209,154,0.12)",
  );
  const quoteBorder = useColorModeValue("#8a242b", "#d8b677");
  const quoteText = useColorModeValue("#5d1d22", "#f0d19a");
  const borderColor = useColorModeValue(
    "rgba(138,36,43,0.22)",
    "rgba(240,209,154,0.24)",
  );
  const inlineCodeBg = useColorModeValue(
    "rgba(113,31,36,0.08)",
    "rgba(240,209,154,0.18)",
  );
  const hasArticle = Boolean(
    article && (article.header || article.text || article.subheader),
  );
  const articleLeadForm = (
    <Box
      mt={{ base: 5, md: 7 }}
      p={{ base: 4, md: 6 }}
      borderRadius={{ base: "20px", md: "24px" }}
      bg="linear-gradient(145deg, rgba(113,31,36,0.96) 0%, rgba(70,18,22,0.96) 100%)"
      border="1px solid rgba(240,209,154,0.32)"
      boxShadow="0 18px 38px rgba(60,20,20,0.18)"
    >
      <Forms
        title="Получите PDF-программу и консультацию по датам"
        countries={countries || []}
        socialNetworks={socialNetworks || []}
      />
    </Box>
  );

  if (!hasArticle) {
    return (
      <>
        <UniversalSeo seo={seo} />
        <Container
          maxW="container.md"
          px={{ base: 4, md: 6 }}
          my={{ base: 8, md: 12 }}
        >
          <Box
            borderRadius="18px"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
            p={{ base: 6, md: 8 }}
            textAlign="center"
          >
            <Text
              color={titleColor}
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="800"
              mb="2"
            >
              Статья не найдена
            </Text>
            <Text color={subtitleColor} fontSize={{ base: "md", md: "lg" }}>
              Проверь ссылку или открой историю с главной страницы.
            </Text>
          </Box>
          {articleLeadForm}
        </Container>
      </>
    );
  }

  return (
    <>
      <UniversalSeo seo={seo} />
      <Container
        maxW="container.lg"
        px={{ base: 4, md: 6 }}
        my={{ base: 5, md: 10 }}
        position="relative"
        zIndex={1}
      >
        <Box
          bg={frameBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius={{ base: "22px", md: "28px" }}
          overflow="visible"
          boxShadow="0 20px 40px rgba(60,20,20,0.16)"
        >
          <Box
            position="relative"
            w="100%"
            overflow="visible"
            borderBottom="1px solid rgba(240,209,154,0.35)"
          >
            <Box
              position="relative"
              overflow="hidden"
              borderTopLeftRadius={{ base: "22px", md: "28px" }}
              borderTopRightRadius={{ base: "22px", md: "28px" }}
            >
              <Box
                as="img"
                src={article?.wallpaper?.url || article?.preview?.url || ""}
                alt={article?.header || "article wallpaper"}
                w="100%"
                h={{ base: "320px", md: "520px" }}
                objectFit="cover"
                display="block"
              />
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-t, rgba(67,22,22,0.9) 0%, rgba(67,22,22,0.72) 28%, rgba(67,22,22,0.44) 58%, rgba(67,22,22,0.18) 78%, transparent 100%)"
              />
              <Box
                position="absolute"
                inset={0}
                bgGradient="linear(to-b, rgba(67,22,22,0.72) 0%, rgba(67,22,22,0.36) 30%, rgba(67,22,22,0.14) 52%, transparent 75%)"
              />
              <Box
                position="absolute"
                inset={0}
                px={{ base: 5, md: 10 }}
                pt={{ base: 6, md: 9 }}
              >
                <VStack align="start" spacing={{ base: 3, md: 4 }}>
                  <Box
                    h="2px"
                    w="100%"
                    bgGradient="linear(to-r, transparent 0%, rgba(246,216,148,0.2) 32%, rgba(255,226,150,0.95) 50%, rgba(246,216,148,0.2) 68%, transparent 100%)"
                    mb={{ base: "1", md: "2" }}
                    position="relative"
                    opacity={0.95}
                    _after={{
                      content: '""',
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translateX(-50%)",
                      w: "10px",
                      h: "10px",
                      borderRadius: "full",
                      bg: "radial-gradient(circle, #ffe7a8 0%, #f6d894 58%, rgba(246,216,148,0) 100%)",
                      boxShadow: "0 0 14px rgba(246,216,148,0.65)",
                      marginTop: "-5px",
                    }}
                    _before={{
                      content: '""',
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      w: "56px",
                      h: "14px",
                      borderRadius: "full",
                      bg: "radial-gradient(ellipse, rgba(246,216,148,0.55) 0%, rgba(246,216,148,0.18) 45%, rgba(246,216,148,0) 100%)",
                    }}
                  />
                  <Text
                    as="h1"
                    color="#f6d894"
                    fontWeight="800"
                    fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                    lineHeight={{ base: "1.1", md: "1.06" }}
                    letterSpacing={{ base: "0.015em", md: "0.01em" }}
                    textTransform="uppercase"
                    textShadow="0 2px 0 rgba(70,20,20,0.5), 0 8px 18px rgba(0,0,0,0.45)"
                  >
                    {article?.header || ""}
                  </Text>
                  {article?.subheader ? (
                    <Text
                      color="rgba(255,255,255,0.94)"
                      fontSize={{ base: "lg", md: "4xl", lg: "4xl" }}
                      fontWeight="400"
                      lineHeight={{ base: "1.35", md: "1.25" }}
                      letterSpacing={{ base: "0.025em", md: "0.02em" }}
                      textTransform="uppercase"
                      textShadow="0 1px 8px rgba(0,0,0,0.35)"
                      maxW="52ch"
                    >
                      {article.subheader}
                    </Text>
                  ) : null}
                  {article ? (
                    <HStack
                      spacing="3"
                      color="white"
                      bg="rgba(0,0,0,0.28)"
                      borderRadius="12px"
                      px="3.5"
                      py="2"
                      border="1px solid rgba(240,209,154,0.28)"
                    >
                      <Box as={RiCalendarEventLine} />
                      <ArticleStats article={article} />
                    </HStack>
                  ) : null}
                </VStack>
              </Box>
            </Box>
            {article?.preview?.url ? (
              <VStack
                position="absolute"
                right={{ base: "-9999px", lg: "-120px", xl: "-122px" }}
                top={{ base: "0", lg: "84px", xl: "250px" }}
                spacing="3"
                zIndex={4}
                align="stretch"
              >
                <Box
                  w={{ lg: "180px", xl: "210px" }}
                  h={{ lg: "250px", xl: "295px" }}
                  position="relative"
                  borderRadius="16px"
                  overflow="hidden"
                  border="2px solid rgba(240,209,154,0.72)"
                  boxShadow="0 24px 46px rgba(0,0,0,0.42)"
                >
                  <Box
                    as="img"
                    src={article.preview.url}
                    alt={article.header || "article preview"}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    display="block"
                  />
                  <Box
                    position="absolute"
                    inset={0}
                    bgGradient="linear(to-t, rgba(91,31,31,0.34) 0%, rgba(91,31,31,0.16) 32%, transparent 68%)"
                    pointerEvents="none"
                  />
                </Box>
              </VStack>
            ) : null}
          </Box>

          <Box
            px={{ base: 5, md: 10 }}
            py={{ base: 6, md: 8 }}
            bg={cardBg}
            color={bodyTextColor}
          >
            {article?.text ? (
              <TextToHTML
                text={article.text}
                components={{
                  p: ({ children, node }) => {
                    const isQuote =
                      (node as any)?.parent?.tagName === "blockquote";
                    return (
                      <Text
                        color={isQuote ? quoteText : bodyTextColor}
                        my={isQuote ? 0 : "4"}
                        fontStyle={isQuote ? "italic" : "normal"}
                        fontSize={{ base: "lg", md: "xl" }}
                        lineHeight="1.85"
                        letterSpacing="0.01em"
                      >
                        {children}
                      </Text>
                    );
                  },
                  h2: ({ children }) => (
                    <Text
                      as="h2"
                      mt={{ base: 7, md: 9 }}
                      mb="3"
                      color={titleColor}
                      fontSize={{ base: "2xl", md: "4xl" }}
                      fontWeight="900"
                      lineHeight="1.2"
                    >
                      {children}
                    </Text>
                  ),
                  h3: ({ children }) => (
                    <Text
                      as="h3"
                      mt={{ base: 5, md: 7 }}
                      mb="2"
                      color={subtitleColor}
                      fontSize={{ base: "xl", md: "2xl" }}
                      fontWeight="800"
                    >
                      {children}
                    </Text>
                  ),
                  ul: ({ children }) => (
                    <UnorderedList spacing="2.5" my="4" ms="0" styleType="none">
                      {children}
                    </UnorderedList>
                  ),
                  ol: ({ children }) => (
                    <OrderedList spacing="2.5" my="4" ps="5">
                      {children}
                    </OrderedList>
                  ),
                  li: ({ children }) => (
                    <ListItem
                      display="flex"
                      alignItems="flex-start"
                      gap="2"
                      mb="1"
                    >
                      <Box
                        as={RiArrowRightSLine}
                        mt="0.3rem"
                        color={titleColor}
                      />
                      <Text
                        as="span"
                        fontSize={{ base: "lg", md: "xl" }}
                        lineHeight="1.75"
                      >
                        {children}
                      </Text>
                    </ListItem>
                  ),
                  blockquote: ({ children }) => (
                    <Box
                      as="blockquote"
                      my="6"
                      px={{ base: 4, md: 6 }}
                      py={{ base: 4, md: 5 }}
                      borderLeftWidth="4px"
                      borderLeftColor={quoteBorder}
                      bg={quoteBg}
                      borderRadius="xl"
                      color={quoteText}
                      sx={{ p: { margin: 0 } }}
                    >
                      {children}
                    </Box>
                  ),
                  hr: () => (
                    <Box
                      my="8"
                      borderTop="1px solid"
                      borderColor={borderColor}
                    />
                  ),
                  a: ({ children, ...props }) => (
                    <Box
                      as="a"
                      color={titleColor}
                      fontWeight="700"
                      textDecoration="underline"
                      textDecorationColor="rgba(138,36,43,0.35)"
                      _hover={{ textDecorationColor: titleColor }}
                      {...props}
                    >
                      {children}
                    </Box>
                  ),
                  strong: ({ children }) => (
                    <Text as="strong" color={titleColor} fontWeight="900">
                      {children}
                    </Text>
                  ),
                  code: ({ children }) => (
                    <Box
                      as="code"
                      bg={inlineCodeBg}
                      px="1.5"
                      py="0.5"
                      borderRadius="md"
                      fontSize="0.92em"
                    >
                      {children}
                    </Box>
                  ),
                }}
              />
            ) : null}
          </Box>
        </Box>

        {articleLeadForm}
      </Container>
    </>
  );
}
