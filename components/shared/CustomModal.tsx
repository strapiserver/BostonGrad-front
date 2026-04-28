import {
  Modal,
  ModalOverlay,
  ModalContent,
  useColorModeValue,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Text,
  Box,
} from "@chakra-ui/react";

import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { triggerModal } from "../../redux/mainReducer";
import Shader from "./Shader";
import { ReactElement } from "react";

const CustomModal = ({
  children,
  id,
  header,
  size = "lg",
}: {
  children: ReactElement;
  id: string;
  header: string | ReactElement;
  size?: string;
}) => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.main.modal === id);

  return (
    <Modal
      size={size}
      isOpen={isOpen}
      onClose={() => dispatch(triggerModal(undefined))}
    >
      <ModalOverlay />
      <ModalContent
        borderRadius="2xl"
        p="2"
        bgColor={useColorModeValue("bg.50", "bg.800")}
        color={useColorModeValue("bg.400", "bg.100")}
        overflow="hidden"
        h="78vh"
      >
        <ModalHeader
          w="100%"
          pt="2"
          pb="2"
          position="relative"
          display="flex"
          justifyContent="center"
        >
          <Text variant="contrast">{header}</Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody
          pb={6}
          p="0"
          overflowY="scroll"
          overflowX="hidden"
          sx={{
            "&::-webkit-scrollbar": {
              width: "0",
            },
            //  "&::-webkit-overflow-scrolling": "touch",
          }}
        >
          {children}
          <Box w="100%" h="20" onScroll={(e) => e.preventDefault()} />
        </ModalBody>
        <Shader direction="top" no_contrast />
      </ModalContent>
    </Modal>
  );
};

export default CustomModal;
