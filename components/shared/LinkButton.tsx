import { Button, Box, Link, useColorModeValue } from "@chakra-ui/react";
import NextLink from "next/link";
import { useAppDispatch } from "../../redux/hooks";
import { clean } from "../../redux/mainReducer";

const LinkButton = ({
  href,
  message,
  CustomIcon,
  variant,
  compact = false,
}: {
  href: string;
  message?: string;
  CustomIcon?: React.ComponentType<any>;
  variant?: string;
  compact?: boolean;
}) => {
  const dispatch = useAppDispatch();
  const color = useColorModeValue("bg.700", "bg.300");
  const iconColor = "red.700";

  const MyButton = ({ handleClick }: { handleClick: () => void }) => (
    <Button
      w={compact ? "auto" : "100%"}
      justifyContent={compact ? "center" : "start"}
      variant={variant || "default"}
      color={color}
      size={compact ? "sm" : "md"}
      my={compact ? "0" : "1"}
      px={compact ? "3" : undefined}
      onClick={() => handleClick()}
      leftIcon={
        CustomIcon ? (
          <Box color={iconColor}>
            <CustomIcon size="1.2rem" />
          </Box>
        ) : undefined
      }
    >
      {message}
    </Button>
  );

  if (href.includes("http")) {
    return (
      <Link href={href} isExternal>
        <MyButton handleClick={() => {}} />
      </Link>
    );
  }

  return (
    <NextLink href={href} passHref>
      <MyButton handleClick={() => dispatch(clean())} />
    </NextLink>
  );
};

export default LinkButton;
