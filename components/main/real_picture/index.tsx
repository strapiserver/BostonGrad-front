import { Box, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import { IRealPicture } from "../../../types/pages";
import CustomImage from "../../shared/CustomImage";
import ViewportWidthWrapper from "../../shared/ViewportWidthWrapper";
import CustomTitle from "../../shared/CustomTitle";

type RealPictureSectionProps = {
  realPicture?: IRealPicture | null;
};

export default function RealPictureSection({
  realPicture,
}: RealPictureSectionProps) {
  const title = realPicture?.title?.trim();
  const subtitle = realPicture?.subtitle?.trim();
  const mainImage = realPicture?.main_image || null;
  const smallImages = Array.isArray(realPicture?.small_images)
    ? realPicture.small_images.filter((image) => image?.url)
    : [];

  if (!title && !subtitle && !mainImage && !smallImages.length) return null;

  return (
    <>
      <Box id="programs">
        {title ? <CustomTitle as="h2" title={title} /> : null}
      </Box>
      <ViewportWidthWrapper mt={{ base: 6, md: 8 }}>
        <Box
          borderRadius="20px"
          overflow="hidden"
          bg="linear-gradient(180deg, rgba(255,248,239,0.98) 0%, rgba(251,241,232,0.98) 100%)"
          border="1px solid rgba(111,29,29,0.14)"
          boxShadow="0 18px 42px rgba(79,16,18,0.10)"
          px={{ base: 4, md: 6 }}
          py={{ base: 5, md: 6 }}
        >
          <VStack align="stretch" spacing={{ base: 4, md: 5 }}>
            {title || subtitle ? (
              <Box maxW="720px">
                {subtitle ? (
                  <Text
                    mt="2"
                    color="rgba(58,37,37,0.86)"
                    fontSize={{ base: "md", md: "lg" }}
                    lineHeight="1.5"
                  >
                    {subtitle}
                  </Text>
                ) : null}
              </Box>
            ) : null}

            <SimpleGrid
              columns={{ base: 1, lg: 2 }}
              spacing={{ base: 4, md: 5 }}
            >
              {mainImage ? (
                <Box
                  borderRadius="18px"
                  overflow="hidden"
                  minH={{ base: "260px", md: "420px" }}
                  bg="#eadfd4"
                >
                  <CustomImage
                    img={mainImage}
                    w="100%"
                    h="100%"
                    minH={{ base: "260px", md: "420px" }}
                    objectFit="cover"
                    adaptiveQuality
                  />
                </Box>
              ) : null}

              {smallImages.length ? (
                <SimpleGrid
                  columns={{ base: 2, md: 2 }}
                  spacing={{ base: 3, md: 4 }}
                  alignContent="start"
                >
                  {smallImages.map((image) => (
                    <Box
                      key={image.id}
                      borderRadius="16px"
                      overflow="hidden"
                      minH={{ base: "140px", md: "200px" }}
                      bg="#efe3d7"
                    >
                      <CustomImage
                        img={image}
                        w="100%"
                        h="100%"
                        minH={{ base: "140px", md: "200px" }}
                        objectFit="cover"
                        adaptiveQuality
                      />
                    </Box>
                  ))}
                </SimpleGrid>
              ) : null}
            </SimpleGrid>
          </VStack>
        </Box>
      </ViewportWidthWrapper>
    </>
  );
}
