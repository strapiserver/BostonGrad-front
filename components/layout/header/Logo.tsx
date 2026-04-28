import { Box, Flex, Text } from "@chakra-ui/react";
import logoLQ from "../../../public/logoLQ.png";
import lightPie from "../../../public/lightPie.svg";
import { useColorModeValue } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useAppDispatch } from "../../../redux/hooks";
import { clean } from "../../../redux/mainReducer";

const Logo = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const logoSrc = useColorModeValue(logoLQ.src, lightPie.src);
  return (
    <Flex
      flexDir="row"
      onClick={() => {
        dispatch(clean());
        router.push("/");
      }}
      cursor="pointer"
      ml="2"
    >
      <Box
        as="img"
        alt={`${process.env.NEXT_PUBLIC_NAME} logo`}
        src={logoSrc}
        w={{ base: "38px", md: "50px" }}
        h={{ base: "38px", md: "50px" }}
      />
      <Text
        fontSize={{ base: "xl", md: "2xl" }}
        color="red.800"
        mx="2"
        mt={{ base: "1", md: "2" }}
        fontWeight="400"
        fontFamily="Arvo, serif"
      >
        BostonGrad
      </Text>
      {/* <ResponsiveText variant="primary" fontSize="2xl" fontWeight="bold" mx="2">
        {process.env.NEXT_PUBLIC_NAME}
      </ResponsiveText> */}
    </Flex>
  );
};

export default Logo;
