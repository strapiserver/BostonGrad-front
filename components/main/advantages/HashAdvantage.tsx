import { Center } from "@chakra-ui/react";
import React from "react";
import { FaLock } from "react-icons/fa";
import { Box3D } from "../../../styles/theme/custom";
import { FaShield } from "react-icons/fa6";
import AdvantageBottom from "./AdvantageBottom";

export default function HashAdvantage({ hovering }: { hovering: boolean }) {
  const ringOpacity = hovering ? "whiteAlpha.300" : "whiteAlpha.100";

  return (
    <>
      <Center position="absolute" top="10" w="100%">
        <Center
          p="2"
          borderRadius="50%"
          border="2px solid"
          borderColor={ringOpacity}
          transition="transform 0.2s ease, border-color 0.2s ease"
          transform={hovering ? "scale(1.05)" : undefined}
        >
          <Center
            p="2"
            borderRadius="50%"
            border="2px solid"
            borderColor={ringOpacity}
          >
            <Box3D
              w="16"
              h="16"
              borderRadius="50%"
              variant="no_contrast"
              dropShadow="lg"
            >
              <Center h="14" color={hovering ? "violet.400" : "violet.500"}>
                <FaLock size="1.6rem" />
              </Center>
            </Box3D>
          </Center>
        </Center>
      </Center>
      <AdvantageBottom
        icon={<FaShield size="1rem" />}
        hovering={hovering}
        title="Безопасность"
        subtitle="Мы отвечаем за надежность обменников"
      />
    </>
  );
}
