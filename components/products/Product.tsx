import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { IProduct } from "../../types/pages";
import { IImage } from "../../types/selector";
import CustomImage from "../shared/CustomImage";
import { LinkWrapper } from "../shared/LinkWrapper";
import { RiArrowRightLine } from "react-icons/ri";

const iconToImage = (value?: IImage | null) => value || null;

const productLink = (product: IProduct) => {
  const code = String(product.article?.code || "")
    .trim()
    .toLowerCase();
  return code ? `/articles/${code}` : "";
};

export default function Product({ product }: { product: IProduct }) {
  const href = productLink(product);
  const subtitles = [
    { text: product.subtitle_1, icon: iconToImage(product.icon_1) },
    { text: product.subtitle_2, icon: iconToImage(product.icon_2) },
    { text: product.subtitle_3, icon: iconToImage(product.icon_3) },
  ].filter((item) => Boolean(String(item.text || "").trim()));

  const card = (
    <Box
      borderRadius="24px"
      overflow="hidden"
      border="1px solid rgba(181,58,63,0.24)"
      bg="linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,243,235,0.98) 100%)"
      boxShadow="0 16px 36px rgba(79,16,18,0.12)"
      transition="transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "0 22px 44px rgba(79,16,18,0.16)",
        borderColor: "rgba(181,58,63,0.38)",
      }}
      w="100%"
      maxW="340px"
      mx="auto"
      height="100%"
      cursor={href ? "pointer" : "default"}
    >
      <VStack align="stretch" spacing="0" height="100%">
        <Box position="relative" w="100%" aspectRatio="340 / 480">
          <Box
            position="absolute"
            inset="0"
            bgGradient="linear(to-t, rgba(79,16,18,0.76) 0%, rgba(79,16,18,0.05) 70%)"
            zIndex={1}
          />
          <CustomImage
            img={product.image}
            w="100%"
            h="100%"
            customAlt={product.title}
            adaptiveQuality
          />
          <Box position="absolute" left="4" right="4" bottom="4" zIndex={2}>
            <Text
              color="white"
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="700"
              lineHeight="1.1"
              textShadow="0 3px 14px rgba(0,0,0,0.35)"
            >
              {product.title}
            </Text>
          </Box>
        </Box>

        <VStack align="stretch" spacing="4" px="5" py="5" flex="1">
          {subtitles.length ? (
            <VStack align="stretch" spacing="3">
              {subtitles.map((item, index) => (
                <HStack
                  key={`${product.id}-${index}`}
                  align="center"
                  spacing="3"
                  minH="36px"
                >
                  <Box
                    flexShrink={0}
                    w="36px"
                    h="36px"
                    borderRadius="full"
                    bg="rgba(181,58,63,0.08)"
                    border="1px solid rgba(181,58,63,0.18)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                  >
                    {item.icon ? (
                      <CustomImage
                        img={item.icon}
                        w="auto"
                        h="20px"
                        objectFit="contain"
                        customAlt=""
                      />
                    ) : (
                      <Box w="8px" h="8px" borderRadius="full" bg="#b53a3f" />
                    )}
                  </Box>
                  <Text
                    color="rgba(58,37,37,0.96)"
                    fontSize={{ base: "md", md: "lg" }}
                    lineHeight="1.45"
                  >
                    {item.text}
                  </Text>
                </HStack>
              ))}
            </VStack>
          ) : null}

          <Box mt="auto">
            {href ? (
              <HStack
                px="4"
                py="3"
                borderRadius="14px"
                bg="linear-gradient(135deg, #7e1f24 0%, #b53a3f 100%)"
                color="white"
                justifyContent="space-between"
                transition="filter 160ms ease"
                _hover={{ filter: "brightness(1.04)" }}
              >
                <Text
                  fontSize="sm"
                  fontWeight="700"
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  Подробнее
                </Text>
                <RiArrowRightLine />
              </HStack>
            ) : (
              <Box
                px="4"
                py="3"
                borderRadius="14px"
                bg="rgba(126,31,36,0.08)"
                color="#7e1f24"
                fontSize="sm"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="0.04em"
                textAlign="center"
              >
                Без страницы статьи
              </Box>
            )}
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
  // -
  return href ? (
    <LinkWrapper url={href} exists fullWidth>
      {card}
    </LinkWrapper>
  ) : (
    card
  );
}
