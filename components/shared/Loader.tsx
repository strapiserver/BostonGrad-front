import { Box, BoxProps, Spinner } from "@chakra-ui/react";

const sizeMap = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
};

type LoaderProps = BoxProps & {
  size?: keyof typeof sizeMap | number;
  src?: string;
  opacity?: number;
  delay?: number;
  shift?: number;
  isActive?: boolean;
};

const Loader = ({
  size = "md",
  src: _src,
  opacity = 1,
  delay: _delay = 0,
  shift: _shift = 0,
  isActive = true,
  ...boxProps
}: LoaderProps) => {
  const px = typeof size === "number" ? size : (sizeMap[size] ?? sizeMap.md);
  const boxSize = `${px}px`;

  return (
    <Box
      boxSize={boxSize}
      filter={`opacity(${isActive ? opacity : 0})`}
      display="flex"
      alignItems="center"
      justifyContent="center"
      {...boxProps}
    >
      <Spinner
        thickness={`${Math.max(2, Math.round(px / 14))}px`}
        speed="0.75s"
        emptyColor="rgba(126,31,36,0.16)"
        color="peach.500"
        boxSize={boxSize}
      />
    </Box>
  );
};

export default Loader;
