import { Divider, Heading, Text } from "@chakra-ui/react";
import { IDirText } from "../../../types/exchange";
import { BoxWrapper, CustomHeader } from "../../shared/BoxWrapper";
import { IoMdInformationCircle } from "react-icons/io";

type CityNarrativeProps = {
  cityText: IDirText | null;
};

const CityDescription = ({ cityText }: CityNarrativeProps) => {
  if (!cityText) return <></>;

  return (
    <BoxWrapper>
      <CustomHeader
        text={cityText.subheader}
        as="h2"
        Icon={IoMdInformationCircle}
      />
      <Divider my="4" />
      {cityText.text && (
        <Text color="bg.600" whiteSpace="pre-line">
          {cityText.text}
        </Text>
      )}
    </BoxWrapper>
  );
};

export default CityDescription;
