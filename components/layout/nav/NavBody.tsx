import {
  RiHome5Fill,
  RiGraduationCapFill,
  RiTelegram2Fill,
  RiHotelFill,
} from "react-icons/ri";
import LinkButton from "../../shared/LinkButton";
import { HStack, VStack } from "@chakra-ui/react";

const NavBody = ({ inline = false }: { inline?: boolean }) => {
  const handleClearStorage = () => {
    if (typeof window === "undefined") return;
    localStorage.clear();
  };

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

      {/* <LinkButton
        message="Suggest Exchange"
        href={"/order"}
        CustomIcon={FiPlusCircle}
      />
      <LinkButton
        message="Create Exchanger"
        href={"/create"}
        CustomIcon={RiTokenSwapLine}
      /> */}
      {/* <LinkButton
        message="Университеты"
        href={"/universities"}
        CustomIcon={RiGraduationCapFill}
        compact={inline}
      /> */}

      {/* <LinkButton
        message="Телеграм"
        href={`https://t.me/${process.env.NEXT_PUBLIC_NAME}`}
        CustomIcon={RiTelegram2Fill}
        compact={inline}
      /> */}
      {/* <LinkButton
        message={t("main:botPage")}
        href={"https://t.me/p2pie_bot"}
        CustomIcon={RiRobot2Line}
      /> */}
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
