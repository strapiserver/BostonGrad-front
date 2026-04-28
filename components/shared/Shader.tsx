import { useToken, useColorModeValue } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";

const Shader = ({
  direction = "top",
  no_contrast = false,
}: {
  direction: "top" | "bottom";
  no_contrast?: boolean;
}) => {
  const [shaderColor] = useToken(
    "colors",
    no_contrast
      ? useColorModeValue(["bg.100"], ["bg.700"])
      : useColorModeValue(["bg.50"], ["bg.900"])
  );

  return (
    <Box
      w="100%"
      boxShadow={`0 0 60px 30px ${shaderColor}`}
      position="absolute"
      left="0"
      top={direction === "bottom" ? "0" : "unset"}
      bottom={direction === "top" ? "0" : "unset"}
      zIndex="10"
    />
  );
};

export default Shader;
