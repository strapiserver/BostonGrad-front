import { RiArrowDownSLine, RiArrowUpSLine } from "react-icons/ri";

// import { SortDescending } from "@styled-icons/heroicons-solid/SortDescending";
// import { SortAscending } from "@styled-icons/heroicons-solid/SortAscending";
// import { IconButton } from "@chakra-ui/react";
// import { SortAlphaUp } from "@styled-icons/bootstrap/SortAlphaUp";
// import { SortAlphaUpAlt } from "@styled-icons/bootstrap/SortAlphaUpAlt";
import { Icon } from "@chakra-ui/react";

export default function Arrow({ isUp }: { isUp: boolean }) {
  return isUp ? (
    <RiArrowUpSLine size="1.2rem" />
  ) : (
    <RiArrowDownSLine size="1.2rem" />
  );
}
