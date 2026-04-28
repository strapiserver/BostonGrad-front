import { Box, Divider, HStack, Icon, BoxProps } from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";
import { Box3D, ResponsiveText } from "../../styles/theme/custom";

type BoxWrapperProps = React.ComponentProps<typeof Box3D> & {
  variant?: "contrast" | "no_contrast" | "extra_contrast";
};

export function BoxWrapper({
  variant = "contrast",
  children,
  my = 6,
  p = 4,
  ...props
}: BoxWrapperProps) {
  return (
    <Box3D my={my} p={p} variant={variant} {...props}>
      {children}
    </Box3D>
  );
}

export function CustomHeader({
  text,
  Icon,
  as,
}: {
  text: string;
  Icon: IconType;
  as?: string;
}) {
  return (
    <HStack color="violet.500">
      <Icon size="1.6rem" />
      <ResponsiveText
        size="lg"
        fontWeight="bold"
        variant="primary"
        as={as || "span"}
        whiteSpace={{ base: "unset", lg: "wrap" }}
      >
        {text}
      </ResponsiveText>
    </HStack>
  );
}

export function ReviewBorder({
  children,
  ...props
}: { children: any } & BoxProps) {
  return (
    <Box
      position="relative"
      zIndex={2}
      borderRadius="xl"
      p="4"
      minW="50%"
      bgColor="bg.900"
      boxShadow="lg"
      {...props}
    >
      {children}
    </Box>
  );
}

export const FormatedDate = ({ updatedAt }: { updatedAt?: string | null }) => {
  const formattedDate = updatedAt
    ? new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(updatedAt))
    : "";
  return (
    <ResponsiveText variant="shaded" as="span">
      {formattedDate}
    </ResponsiveText>
  );
};
