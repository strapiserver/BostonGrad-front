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
import { RiArticleLine, RiArrowRightSLine, RiCalendarEventLine } from "react-icons/ri";
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
  const cardBg = useColorModeValue("rgba(255,255,255,0.86)", "rgba(32,24,24,0.9)");
  const titleColor = useColorModeValue("#711f24", "#f0d19a");
  const subtitleColor = useColorModeValue("rgba(50,30,30,0.85)", "rgba(240,220,180,0.85)");
  const bodyTextColor = useColorModeValue("#2f2424", "#e7dbce");
  const quoteBg = useColorModeValue("rgba(138,36,43,0.07)", "rgba(240,209,154,0.12)");
  const quoteBorder = useColorModeValue("#8a242b", "#d8b677");
  const quoteText = useColorModeValue("#5d1d22", "#f0d19a");
  const borderColor = useColorModeValue("rgba(138,36,43,0.22)", "rgba(240,209,154,0.24)");
  const inlineCodeBg = useColorModeValue("rgba(113,31,36,0.08)", "rgba(240,209,154,0.18)");
  const hasArticle = Boolean(article && (article.header || article.text || article.subheader));
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
        <Container maxW="container.md" px={{ base: 4, md: 6 }} my={{ base: 8, md: 12 }}>
          <Box
            borderRadius="18px"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
            p={{ base: 6, md: 8 }}
            textAlign="center"
          >
            <Text color={titleColor} fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800" mb="2">
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
      <Container maxW="container.lg" px={{ base: 4, md: 6 }} my={{ base: 5, md: 10 }}>
        <Box
          bg={frameBg}
          border="1px solid"
          borderColor={borderColor}
          borderRadius={{ base: "22px", md: "28px" }}
          overflow="hidden"
          boxShadow="0 20px 40px rgba(60,20,20,0.16)"
        >
          <Box
            px={{ base: 5, md: 10 }}
            pt={{ base: 6, md: 9 }}
            pb={{ base: 5, md: 7 }}
            bg="linear-gradient(145deg, rgba(113,31,36,0.96) 0%, rgba(70,18,22,0.95) 100%)"
            borderBottom="1px solid rgba(240,209,154,0.35)"
          >
            <VStack align="start" spacing={{ base: 3, md: 4 }}>
              <HStack
                color="#f0d19a"
                bg="rgba(255,255,255,0.08)"
                border="1px solid rgba(240,209,154,0.35)"
                borderRadius="full"
                px="3"
                py="1.5"
                fontSize="sm"
                fontWeight="700"
                letterSpacing="0.05em"
                textTransform="uppercase"
              >
                <Box as={RiArticleLine} />
                <Text>История</Text>
              </HStack>
              <Text as="h1" color="white" fontWeight="900" fontSize={{ base: "2xl", md: "4xl" }} lineHeight="1.15">
                {article?.header || ""}
              </Text>
              {article?.subheader ? (
                <Text color="rgba(255,255,255,0.9)" fontSize={{ base: "md", md: "xl" }} maxW="52ch">
                  {article.subheader}
                </Text>
              ) : null}
              {article ? (
                <HStack
                  spacing="3"
                  color="white"
                  bg="rgba(0,0,0,0.16)"
                  borderRadius="12px"
                  px="3.5"
                  py="2"
                  border="1px solid rgba(240,209,154,0.2)"
                >
                  <Box as={RiCalendarEventLine} />
                  <ArticleStats article={article} />
                </HStack>
              ) : null}
            </VStack>
          </Box>

          <Box px={{ base: 5, md: 10 }} py={{ base: 6, md: 8 }} bg={cardBg} color={bodyTextColor}>
            {article?.text ? (
              <TextToHTML
                text={article.text}
                components={{
                  p: ({ children, node }) => {
                    const isQuote = (node as any)?.parent?.tagName === "blockquote";
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
                    <ListItem display="flex" alignItems="flex-start" gap="2" mb="1">
                      <Box as={RiArrowRightSLine} mt="0.3rem" color={titleColor} />
                      <Text as="span" fontSize={{ base: "lg", md: "xl" }} lineHeight="1.75">
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
                  hr: () => <Box my="8" borderTop="1px solid" borderColor={borderColor} />,
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
