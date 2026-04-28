import { Box, HStack } from "@chakra-ui/react";
import { HORIZONTAL_PAD } from "./constants";
import UniCard from "./UniCard";
import UniNavButton from "./UniNavButton";
import { useUniCarousel } from "./useUniCarousel";
import type { UniPreviewProps } from "./types";

const UniPreviewCarousel = ({ unis }: UniPreviewProps) => {
  const {
    isDragging,
    onMouseDown,
    onMouseMove,
    onMouseUpOrLeave,
    scrollByCard,
    scrollRef,
  } = useUniCarousel(unis?.length);

  if (!unis?.length) return null;

  return (
    <Box
      position="relative"
      width={{ base: "100%", md: "100vw" }}
      left={{ base: "0", md: "50%" }}
      right={{ base: "0", md: "50%" }}
      ml={{ base: "0", md: "-50vw" }}
      mr={{ base: "0", md: "-50vw" }}
    >
      <Box w="100%" position="relative">
        <Box
          ref={scrollRef}
          w={{ base: "100%", md: "100vw" }}
          overflowX="auto"
          scrollBehavior="smooth"
          scrollSnapType="x mandatory"
          px={HORIZONTAL_PAD}
          py="4"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUpOrLeave}
          onMouseLeave={onMouseUpOrLeave}
          cursor={isDragging ? "grabbing" : "grab"}
          sx={{
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <HStack
            w="max-content"
            spacing="4"
            alignItems="stretch"
            flexWrap="nowrap"
          >
            {unis.map((uni, idx) => (
              <UniCard key={uni.id} uni={uni} idx={idx} />
            ))}
          </HStack>
        </Box>

        <UniNavButton direction="left" onClick={() => scrollByCard("left")} />
        <UniNavButton direction="right" onClick={() => scrollByCard("right")} />
      </Box>
    </Box>
  );
};

export default UniPreviewCarousel;
