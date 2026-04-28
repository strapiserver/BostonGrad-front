import { HStack } from "@chakra-ui/react";
import Language from "./Language";
import GlobalSearch from "./globalSearch";

export const NavHeading = () => {
  return (
    <HStack>
      <GlobalSearch />
      {/* <Language /> */}
      {/* <DarkLightTheme /> */}
    </HStack>
  );
};

export default NavHeading;
