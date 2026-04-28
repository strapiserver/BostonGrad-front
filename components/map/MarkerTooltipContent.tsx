import { VStack, Divider, Text, HStack, Box, Center } from "@chakra-ui/react";
import { memo, useMemo } from "react";
import { IExchanger, IExchangerOffice } from "../../types/exchanger";
import { ResponsiveText } from "../../styles/theme/custom";
import ExchangerName from "../shared/ExchangerNameRating";
import CustomImage from "../shared/CustomImage";

export const MarkerTooltipContent = memo(
  ({
    exchanger,
    office,
  }: {
    exchanger: IExchanger;
    office?: IExchangerOffice | null;
  }) => {
    const { exchanger_card, offices, admin_rating, logo } = exchanger;
    const displayName = exchanger.display_name || exchanger.name;

    const resolvedOffice = office ?? offices?.[0];

    const contact = useMemo(() => {
      return exchanger_card?.telegram || exchanger_card?.email || null;
    }, [exchanger_card?.telegram, exchanger_card?.email]);

    return (
      <VStack align="start" spacing="1" p="2" maxW="400px" minW="400px">
        <ExchangerName
          name={displayName}
          admin_rating={admin_rating}
          logo={logo}
        />
        <Divider my="2" />
        <ResponsiveText fontSize="md" fontWeight="bold" whiteSpace="unset">
          {resolvedOffice?.address}
        </ResponsiveText>

        {resolvedOffice?.working_time && (
          <HStack alignItems="center">
            <Box w="8px" h="8px" bg="green.200" borderRadius="50%" />
            <ResponsiveText fontSize="sm" whiteSpace="unset">
              {`Время работы: ${resolvedOffice?.working_time}`}
            </ResponsiveText>
          </HStack>
        )}

        <ResponsiveText fontSize="xs" whiteSpace="unset">
          {resolvedOffice?.description}
        </ResponsiveText>
        {resolvedOffice?.image && (
          <Center w="100%">
            <CustomImage img={resolvedOffice?.image} w="auto" h="auto" />
          </Center>
        )}

        {/* {contact && (
          <>
            <Divider borderColor="whiteAlpha.300" my="1" />
            <ResponsiveText fontSize="xs" color="bg.500">
              {contact}
            </ResponsiveText>
          </>
        )} */}
      </VStack>
    );
  }
);
