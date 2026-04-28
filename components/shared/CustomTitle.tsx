import {
  useToken,
  Text,
  useColorModeValue,
  Box,
  BoxProps,
} from "@chakra-ui/react";
import React from "react";

type CustomTitleProps = {
  as: "h1" | "h2" | "h3";
  title: string;
  subtitle?: string;
  subtitle2?: string;
} & BoxProps;

export default function ({
  as,
  title,
  subtitle,
  subtitle2,
  ...props
}: CustomTitleProps) {
  const [peripheryColor, centerColor] = useToken(
    "colors",
    useColorModeValue(["orange.900", "red.600"], ["bg.200", "red.600"]),
  );

  return (
    <Box
      mt={{ base: "6", lg: "10" }}
      mb={{ base: "4", lg: "8" }}
      zIndex="1"
      bgGradient={`radial-gradient(circle at 50% -10%, ${centerColor} 10%, ${peripheryColor} 70%)`}
      bgClip="text"
      fontSize={{ base: "lg", lg: "5xl" }}
      w="100%"
      textAlign={"center"}
      {...props}
    >
      <Text
        as={as}
        fontWeight="semibold"
        fontFamily="Montserrat, sans-serif"
        color="inherit"
        fontSize="inherit"
      >
        {title}
      </Text>
      {/* {subtitle && (
        <Text
          as="p"
          fontSize={{ base: "sm", lg: "xl" }}
          mt={2}
          color="bg.700"
          fontWeight="light"
          fontFamily="Montserrat, sans-serif"
        >
          {subtitle}
        </Text>
      )} */}

      {subtitle2 && (
        <Text
          as="p"
          fontSize={{ base: "md", lg: "xl" }}
          mt={2}
          color="bg.700"
          fontWeight="light"
          fontFamily="Montserrat, sans-serif"
        >
          {subtitle2}
        </Text>
      )}
    </Box>
  );
}
