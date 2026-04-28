import { Box, Flex, HStack, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import { ResponsiveText } from "../../../styles/theme/custom";
import Advantage from "./Advantage";
import plots from "../../../public/plots.png";
import dots from "../../../public/dots.png";
import hash from "../../../public/hash.png";
import HashAdvantage from "./HashAdvantage";
import DotsAdvantage from "./DotsAdvantage";
import PlotAdvantage from "./PlotAdvantage";

export default function Advantages() {
  const ambientColor = useColorModeValue(
    "rgba(143,92,292,0.2)",
    "rgba(247, 197, 177, 0.1)",
  );
  return (
    <Flex
      flexDir={{ base: "column", lg: "row" }}
      gap="4"
      alignItems="stretch"
      position="relative"
    >
      <Box
        position="absolute"
        inset={0}
        zIndex={0}
        top="-150px"
        pointerEvents="none" // <-- lets all clicks/touches pass through
        bgGradient={`radial-gradient(ellipse at 50% 50%, ${ambientColor} 10%, transparent 65%)`}
      />
      <Advantage alt="advantage-dots" imageSrc={dots}>
        {(hovering) => <DotsAdvantage hovering={hovering} />}
      </Advantage>
      <Advantage alt="advantage-plot" imageSrc={plots}>
        {(hovering) => <PlotAdvantage hovering={hovering} />}
      </Advantage>
      <Advantage alt="advantage-hash" imageSrc={hash}>
        {(hovering) => <HashAdvantage hovering={hovering} />}
      </Advantage>
    </Flex>
  );
}
