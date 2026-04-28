import React from "react";
import { useAppSelector } from "../../../redux/hooks";
import { Box, HStack, ScaleFade, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { format } from "../../../redux/amountsHelper";
import Dot from "../../exchangers/Dot";
import { RiExchange2Fill } from "react-icons/ri";
import AdvantageBottom from "./AdvantageBottom";
import { buildRateString } from "../../shared/helper";
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.25); }
  100% { transform: scale(1); }
`;

export default function PlotAdvantage({ hovering }: { hovering: boolean }) {
  const ccRates = useAppSelector((state) => state.main.ccRates);
  const [giveCur, getCur] = ["BTC", "руб."];
  const course = ccRates?.currentRate || 0;
  // const rate =
  //   course < 1
  //     ? `1 ${giveCur} ≈ ${format(1 / course, 1)} ${getCur}`
  //     : ` ${format(course, 1)} ${giveCur} ≈ 1 ${getCur}`;

  return (
    <>
      <Box top="6" position="absolute" right="6">
        <Text color="bg.700" fontSize="xs" mt="0.5">
          Курс биткойна сейчас:
        </Text>
        <HStack gap="2" alignItems="center">
          <Text color="violet.500" fontSize="sm" mt="0.5">
            {buildRateString({ course, giveCur, getCur })}
          </Text>

          <Box animation={`${pulse} 1s ease-in-out infinite`} w="4">
            <ScaleFade in={hovering} initialScale={0}>
              <Dot color="green" />
            </ScaleFade>
          </Box>
        </HStack>
      </Box>
      <AdvantageBottom
        icon={<RiExchange2Fill size="1rem" />}
        hovering={hovering}
        title="Актуальный курс"
        subtitle="Обменники опрашиваются раз в пару минут"
      />
    </>
  );
}
