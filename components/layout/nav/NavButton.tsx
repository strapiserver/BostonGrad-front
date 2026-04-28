import { Button, Icon, Text } from "@chakra-ui/react";
import { StyledIcon } from "@styled-icons/styled-icon";
import { IconType } from "react-icons";

const NavButton = ({
  handleClick,
  icon,
}: {
  handleClick: () => void;
  icon: StyledIcon | IconType | string;
}) => {
  return (
    <Button w="8" h="8" variant="contrast" onClick={handleClick} mx="1">
      {typeof icon === "string" ? (
        <Text>{icon}</Text>
      ) : (
        <Icon as={icon} w="5" h="5" />
      )}
    </Button>
  );
};

export default NavButton;
