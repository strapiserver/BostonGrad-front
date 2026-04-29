import {
  RiHome5Fill,
  RiHotelFill,
} from "react-icons/ri";
import LinkButton from "../../shared/LinkButton";
import { HStack, VStack } from "@chakra-ui/react";

const NavBody = ({ inline = false }: { inline?: boolean }) => {
  const Wrapper = inline ? HStack : VStack;

  return (
    <Wrapper
      spacing={inline ? "1" : "0"}
      alignItems={inline ? "center" : "stretch"}
      flexWrap={inline ? "nowrap" : "wrap"}
    >
      <LinkButton
        message="Домой"
        href={"/"}
        CustomIcon={RiHome5Fill}
        compact={inline}
      />
      <LinkButton
        message="Проживание"
        href={"/articles/living"}
        CustomIcon={RiHotelFill}
        compact={inline}
      />
    </Wrapper>
  );
};

export default NavBody;
