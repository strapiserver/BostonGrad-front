import {
  Box,
  Flex,
  Grid,
  HStack,
  Text,
  useColorModeValue,
  useToken,
} from "@chakra-ui/react";
import Logo from "./Logo";

import SwipeableDrawer from "./drawer";
import NavHeading from "../nav/NavHeading";
import CitySelector from "./city";
import NavBody from "../nav/NavBody";
import { transparentize } from "@chakra-ui/theme-tools";

const Header = () => {
  const [bg100, bg1000] = useToken("colors", ["bg.100", "bg.1000"]);
  const bgColor = useColorModeValue(
    transparentize(bg100, 0.95), // 0.2 → 20% more transparent
    transparentize(bg1000, 0.95)
  );

  return (
    <Flex
      h="56px" // строго
      position="sticky"
      top="0"
      bgColor={bgColor as any}
      p={[2, 4]}
      zIndex="modal"
      justifyContent="stretch"
      boxShadow="lg"
    >
      <HStack w="100%" justifyContent="space-between">
        <HStack spacing="3" minW={0}>
          <Logo />
        </HStack>

        <HStack>
          <Box display={{ base: "none", xl: "block" }}>
            <NavBody inline />
          </Box>
          <CitySelector />
          <SwipeableDrawer />

          <Box display={{ base: "none", xl: "block" }}>
            <NavHeading />
          </Box>
        </HStack>
      </HStack>
    </Flex>
  );
};

export default Header;
