import {
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
  useColorModeValue,
  Box,
} from "@chakra-ui/react";
import React from "react";
import { AiOutlineMenu } from "react-icons/ai";
import NavBody from "../../nav/NavBody";
import NavButton from "../../nav/NavButton";
import GlobalSearch from "../../nav/globalSearch";

const SwipeableDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const bgColor = useColorModeValue("bg.100", "bg.700");
  const handleSwipeStart = (e: any) => {
    const startX = e.touches[0].clientX;

    const handleTouchMove = (e: any) => {
      const moveX = e.touches[0].clientX;
      // Swipe left to close
      if (startX < moveX - 30) {
        onClose();
        document.removeEventListener("touchmove", handleTouchMove);
      }
    };

    document.addEventListener("touchmove", handleTouchMove);

    // Clean up the touchmove listener
    document.addEventListener("touchend", () => {
      document.removeEventListener("touchmove", handleTouchMove);
    });
  };

  return (
    <Box display={{ base: "block", xl: "none" }}>
      <NavButton handleClick={onOpen} icon={AiOutlineMenu} />

      <Drawer
        finalFocusRef={btnRef as any}
        placement="left"
        size="xs"
        onClose={onClose}
        isOpen={isOpen}
      >
        <DrawerOverlay bgColor="blackAlpha.200" />
        <DrawerContent
          w="fit-content"
          minW="260"
          onTouchStart={handleSwipeStart}
          bgColor={bgColor}
        >
          <DrawerCloseButton color="bg.800" />
          <DrawerBody>
            <Box mb="4">
              <GlobalSearch />
            </Box>
            <Box onClick={onClose}>
              <NavBody />
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default SwipeableDrawer;
