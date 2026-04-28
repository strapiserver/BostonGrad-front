import { Box, Grid } from "@chakra-ui/react";

import { BsArrowRightShort } from "react-icons/bs";
import PmName from "../shared/PmName";
import { IPm } from "../../types/selector";
import { Box3D } from "../../styles/theme/custom";
import { LinkWrapper } from "../shared/LinkWrapper";

const Dir = ({
  children,
  givePm,
  getPm,
  slug,
  bottomLeft,
  bottomRight,
  fullHeight,
}: {
  slug: string;
  givePm?: IPm;
  getPm?: IPm;
  children?: any;
  bottomLeft?: React.ReactNode;
  bottomRight?: React.ReactNode;
  fullHeight?: boolean;
}) => {
  const leftContent = bottomLeft ?? children ?? null;
  const rightContent = bottomRight ?? null;

  return (
    <LinkWrapper url={`/${slug}`} exists fullWidth>
      <Box3D
        w="100%"
        flex="1"
        px="4"
        py="2"
        cursor="pointer"
        display="block"
        alignSelf="stretch"
        transition="filter 0.2s ease-in"
        _hover={{ filter: "brightness(1.1)" }}
        variant="contrast"
        minH={fullHeight ? "70px" : "unset"}
      >
        <Grid
          gridTemplateColumns={"1fr 40px 1fr"}
          gridTemplateRows="auto"
          color="bg.800"
          alignItems="center"
          columnGap="2"
        >
          <Box gridColumn="1" display="flex" flexDir="column" gap="1">
            <PmName pm={givePm} isFull={false} />
            {leftContent}
          </Box>

          <Box gridColumn="2" justifySelf="center">
            <BsArrowRightShort size="1.5rem" />
          </Box>

          <Box gridColumn="3" display="flex" flexDir="column" gap="1">
            <PmName pm={getPm} isFull={false} />
            {rightContent}
          </Box>
        </Grid>
      </Box3D>
    </LinkWrapper>
  );
};

export default Dir;
