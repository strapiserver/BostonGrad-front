import { Flex, Text, VStack } from "@chakra-ui/react";
import { IVisa } from "../../../types/pages";
import CustomImage from "../../shared/CustomImage";
import ViewportWidthWrapper from "../../shared/ViewportWidthWrapper";

type SummerInviteProps = {
  visa?: IVisa | null;
};

export default function SummerInvite({ visa }: SummerInviteProps) {
  const header = visa?.header?.trim();
  const subheader = visa?.subheader?.trim();
  const icon = visa?.icon || null;
  const image = visa?.image || null;

  if (!header && !subheader && !icon && !image) return null;

  return (
    <ViewportWidthWrapper>
      <Flex
        align={{ base: "stretch", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={{ base: 4, md: 6 }}
        w="100%"
        overflow="hidden"
        borderRadius="16px"
        border="1px solid rgba(117, 39, 39, 0.08)"
        bg="linear-gradient(90deg, #fbf1e8 0%, #fff7f1 100%)"
        px={{ base: 4, md: 5 }}
        py={{ base: 4, md: 3 }}
      >
        <Flex
          align={{ base: "flex-start", md: "center" }}
          direction="row"
          flex={{ base: "0 0 auto", md: "1 1 auto" }}
          gap={{ base: 3, md: 5 }}
          minW={0}
          w={{ base: "100%", md: "auto" }}
        >
          {icon ? (
            <Flex
              align="center"
              justify="center"
              flex={{ base: "0 0 64px", md: "0 0 76px" }}
              p={{ base: 2, md: 3 }}
            >
              <CustomImage
                img={icon}
                w={{ base: "44px", md: "52px" } as any}
                h={{ base: "44px", md: "52px" } as any}
                objectFit="contain"
              />
            </Flex>
          ) : null}

          <VStack
            align="stretch"
            spacing={1}
            maxW={{ base: "none", md: "360px" }}
            minW={{ base: 0, md: "260px" }}
          >
            {header ? (
              <Text
                color="#6f1d1d"
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="800"
                lineHeight="1.18"
              >
                {header}
              </Text>
            ) : null}
            {subheader ? (
              <Text
                color="#2f211f"
                fontSize={{ base: "sm", md: "sm" }}
                lineHeight="1.35"
              >
                {subheader}
              </Text>
            ) : null}
          </VStack>
        </Flex>

        {image ? (
          <CustomImage
            img={image}
            w={{ base: "100%", md: "min(52vw, 800px)" } as any}
            h={{ base: "auto", md: "120px" } as any}
            maxW={{ base: "100%", md: "800px" }}
            aspectRatio={{ base: "800 / 120", md: "auto" }}
            objectFit="contain"
            flex={{ base: "0 0 auto", md: "0 0 auto" }}
            alignSelf={{ base: "stretch", md: "center" }}
          />
        ) : null}
      </Flex>
    </ViewportWidthWrapper>
  );
}
