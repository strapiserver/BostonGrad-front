import { Box, BoxProps } from "@chakra-ui/react";

export default function ViewportWidthWrapper({ children, ...props }: BoxProps) {
  return (
    <Box
      ml={{ base: "calc(50% - 50vw)", md: "calc(50% - 35vw)" }}
      mr={{ base: "calc(50% - 50vw)", md: "calc(50% - 35vw)" }}
      px={{ base: 3, md: 8 }}
      w={{ base: "100vw", md: "70vw" }}
      {...props}
    >
      {children}
    </Box>
  );
}
