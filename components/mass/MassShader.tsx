import { useToken, useColorModeValue } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";

const MassShader = ({ direction = "top" }: { direction: "top" | "bottom" }) => {
  const [shaderColor] = useToken(
    "colors",
    useColorModeValue(["bg.100"], ["bg.900"]),
  );

  return (
    <Box
      w="100%"
      boxShadow={`0 0 20px 15px ${shaderColor}`}
      position="absolute"
      left="0"
      top={direction === "bottom" ? "0" : "unset"}
      bottom={direction === "top" ? "0" : "unset"}
      zIndex="10"
    />
  );
};

export default MassShader;
