import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { IProduct } from "../../types/pages";
import { IImage } from "../../types/selector";
import CustomImage from "../shared/CustomImage";
import { LinkWrapper } from "../shared/LinkWrapper";
import { RiArrowRightLine } from "react-icons/ri";
import { fbqTrackCustom } from "../../services/metaPixel";

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
      onClick={
        href
          ? () =>
              fbqTrackCustom("ClickProgram", {
                source: "product_card",
                program_id: product.id,
                program_title: product.title,
                url: href,
              })
          : undefined
      }
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
              fontSize={{ base: "md", md: "xl" }}
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
            <VStack align="stretch" spacing={{ base: "2.5", md: "3" }}>
              {subtitles.map((item, index) => (
                <HStack
                  key={`${product.id}-${index}`}
                  align="center"
                  spacing={{ base: "2.5", md: "3" }}
                  minH={{ base: "32px", md: "36px" }}
                >
                  <Box
                    flexShrink={0}
                    w={{ base: "32px", md: "36px" }}
                    h={{ base: "32px", md: "36px" }}
                    borderRadius="full"
                    bg="rgba(181,58,63,0.08)"
                    border="1px solid rgba(181,58,63,0.18)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    overflow="hidden"
                  >
                    {item.icon ? (
                      <Box h={{ base: "16px", md: "20px" }}>
                        <CustomImage
                          img={item.icon}
                          w="auto"
                          h="100%"
                          objectFit="contain"
                          customAlt=""
                        />
                      </Box>
                    ) : (
                      <Box
                        w={{ base: "6px", md: "8px" }}
                        h={{ base: "6px", md: "8px" }}
                        borderRadius="full"
                        bg="#b53a3f"
                      />
                    )}
                  </Box>
                  <Text
                    color="rgba(58,37,37,0.96)"
                    fontSize={{ base: "sm", md: "lg" }}
                    lineHeight="1.45"
                  >
                    {item.text}
                  </Text>
                </HStack>
              ))}
            </VStack>
          ) : null}

          {href ? (
            <Box mt="auto">
              <HStack
                px={{ base: "3.5", md: "4" }}
                py={{ base: "2.5", md: "3" }}
                borderRadius="14px"
                bg="linear-gradient(135deg, #7e1f24 0%, #b53a3f 100%)"
                color="white"
                justifyContent="space-between"
                transition="filter 160ms ease"
                _hover={{ filter: "brightness(1.04)" }}
              >
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="700"
                  letterSpacing="0.04em"
                  textTransform="uppercase"
                >
                  Подробнее
                </Text>
                <Box as={RiArrowRightLine} boxSize={{ base: "16px", md: "20px" }} />
              </HStack>
            </Box>
          ) : null}
        </VStack>
      </VStack>
    </Box>
  );
  return href ? (
    <LinkWrapper url={href} exists fullWidth>
      {card}
    </LinkWrapper>
  ) : (
    card
  );
}
