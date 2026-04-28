import { useToken, Box } from "@chakra-ui/react";
import { IDotColors } from "../../types/exchanger";

export default function Dot({ color }: { color?: IDotColors }) {
  const c = color ? `${color}.300` : "bg.300";
  const [tc] = useToken(
    // the key within the theme, in this case `theme.colors`
    "colors",
    // the subkey(s), resolving to `theme.colors.red.100`
    [color || "bg.300"]
    // a single fallback or fallback array matching the length of the previous arg
  );
  return (
    <Box
      w="2"
      h="2"
      borderRadius="50%"
      bgColor={c}
      boxShadow={`0px 0px 15px ${tc}`}
    ></Box>
  );
}
