import { Box } from "@chakra-ui/react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import type { ScrollDirection } from "./types";

type UniNavButtonProps = {
  direction: ScrollDirection;
  onClick: () => void;
};

const UniNavButton = ({ direction, onClick }: UniNavButtonProps) => {
  const Icon = direction === "left" ? MdChevronLeft : MdChevronRight;

  return (
    <Box
      display={{ base: "block", lg: "none" }}
      position="absolute"
      left={direction === "left" ? { base: "1", md: "6" } : undefined}
      right={direction === "right" ? { base: "1", md: "6" } : undefined}
      top="50%"
      transform="translateY(-50%)"
      zIndex={3}
      bg="rgba(255,255,255,0.92)"
      border="1px solid"
      borderColor="gray.300"
      borderRadius="full"
      cursor="pointer"
      onClick={onClick}
      p={{ base: "2", md: "1" }}
      boxShadow="md"
      color="gray.800"
    >
      <Icon size="1.25rem" />
    </Box>
  );
};

export default UniNavButton;
