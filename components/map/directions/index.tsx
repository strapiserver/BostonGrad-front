import { Divider, VStack, Text, Box } from "@chakra-ui/react";
import { CityCashSection, MapHeadings } from "../types";
import SectionEntries from "./SectionEntries";
import { BoxWrapper, CustomHeader } from "../../shared/BoxWrapper";
import { RiExchangeFill } from "react-icons/ri";

type CashDirectionsProps = {
  sections: CityCashSection[];
  headings: MapHeadings;
  cityName: string;
};

const CashDirections = ({
  sections,
  headings,
  cityName,
}: CashDirectionsProps) => {
  return (
    <VStack align="stretch" spacing="4" mt="6">
      <BoxWrapper>
        <CustomHeader text={headings.directionsTitle} as="h2" Icon={RiExchangeFill} />
        <Divider my="4" />
        {!sections.length && <Text color="bg.600">{headings.directionsEmpty}</Text>}
      </BoxWrapper>
      {sections.map((section) => (
        <Box key={section.currencyCode}>
          <VStack align="stretch" spacing="4">
            {section.buy.length > 0 && (
              <SectionEntries
                title={section.buyTitle}
                entries={section.buy}
                cashPm={section.cashPm}
                direction="buy"
                cityName={cityName}
              />
            )}
            {section.sell.length > 0 && (
              <SectionEntries
                title={section.sellTitle}
                entries={section.sell}
                cashPm={section.cashPm}
                direction="sell"
                cityName={cityName}
              />
            )}
          </VStack>
        </Box>
      ))}
    </VStack>
  );
};

export default CashDirections;
