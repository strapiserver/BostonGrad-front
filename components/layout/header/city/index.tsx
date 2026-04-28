import { Box } from "@chakra-ui/react";
import { FaMapMarkerAlt } from "react-icons/fa";
import Arrow from "../../../shared/Arrow";
import { useAppDispatch, useAppSelector } from "../../../../redux/hooks";
import { triggerModal } from "../../../../redux/mainReducer";
import { ResponsiveButton } from "../../../../styles/theme/custom";
import CustomModal from "../../../shared/CustomModal";
import Countries from "./Countries";
import React from "react";
import { useRouter } from "next/router";
import { locale } from "../../../../services/utils";

const CitySelector = ({ forceVisible }: { forceVisible?: boolean }) => {
  const router = useRouter();

  const path = router.asPath;
  const currentCityName = useAppSelector(
    (state) => state.main?.city[`${locale}_name`]
  );

  const dispatch = useAppDispatch();

  const lastString = path.split("/")[path.split("/").length - 1];
  let pageType;
  const isCash =
    lastString.startsWith("cash-") || lastString.includes("-cash-");
  const isMapPage = path.includes("map/");
  const isMassPage = path.includes("sell/") || path.includes("buy/");

  if (isCash) pageType = "cash";
  if (isMapPage) pageType = "map";
  if (isMassPage) pageType = "mass";
  if (!forceVisible && !isCash && !isMapPage && !isMassPage) return <></>;

  return (
    <Box>
      <CustomModal id="location" header="Выберите город:">
        <Countries pageType={pageType} />
      </CustomModal>

      <ResponsiveButton
        variant="default"
        p="1"
        mx="2"
        leftIcon={<FaMapMarkerAlt size="1.2rem" />}
        rightIcon={<Arrow isUp={false} />}
        onClick={() => dispatch(triggerModal("location"))}
      >
        {currentCityName || "Город"}
      </ResponsiveButton>
    </Box>
  );
};

export default CitySelector;
