import React from "react";
import { Back } from "@styled-icons/entypo/Back";
import { Box, Button, Center, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { Box3D } from "../styles/theme/custom";
import ErrorWrapper from "../components/shared/ErrorWrapper";
function NotFound() {
  return (
    <Flex width="100%" justifyContent="center" alignItems="center" mt="5">
      <Box3D minW="400px" minH="200px" variant="extra_contrast">
        <ErrorWrapper
          isError={true}
          primaryMessage="404"
          secondaryMessage="Страницы пока не существует"
        >
          <Box />
        </ErrorWrapper>
        <Center w="100%" h="20">
          <Link href={`/`}>
            <Button p="2" m="2">
              <Back size={30} style={{ margin: 5 }} />
            </Button>
          </Link>
        </Center>
      </Box3D>
    </Flex>
  );
}

export default NotFound;
