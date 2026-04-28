import {
  Tooltip,
  Box,
  Center,
  HStack,
  IconButton,
  Text,
} from "@chakra-ui/react";
import React, { useState, memo, useEffect, useRef } from "react";
import { FaLocationPin } from "react-icons/fa6";
import { IExchanger, IExchangerOffice } from "../../types/exchanger";
import { MarkerTooltipContent } from "./MarkerTooltipContent";
import CustomImage from "../shared/CustomImage";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type CustomMarkerProps = {
  id: string;
  entries: {
    exchanger: IExchanger;
    office: IExchangerOffice | null;
  }[];
  highlighted?: boolean;
  activeMarkerId?: string | null;
  setActiveMarkerId?: (id: string | null) => void;
};

const CustomMarker = ({
  id,
  entries,
  highlighted = false,
  activeMarkerId,
  setActiveMarkerId,
}: CustomMarkerProps) => {
  const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
  const [localActive, setLocalActive] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentEntryIndex(0);
  }, [id, entries.length]);

  if (!entries.length) return null;

  const totalEntries = entries.length;
  const currentEntry =
    entries[Math.min(currentEntryIndex, totalEntries - 1)] || entries[0];
  const primaryExchanger = entries[0].exchanger;

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      if (setActiveMarkerId) setActiveMarkerId(null);
      else setLocalActive(false);
      setHoveredMarker(false);
      setHoveredTooltip(false);
    }, 300);
  };

  const openMarker = () => {
    clearCloseTimer();
    if (setActiveMarkerId) setActiveMarkerId(id);
    else setLocalActive(true);
    setHoveredMarker(true);
  };

  const isActive =
    activeMarkerId !== undefined ? activeMarkerId === id : localActive;
  const isOpen = isActive || hoveredMarker || hoveredTooltip;
  const pinColor = highlighted ? "#d1a756" : isOpen ? "#f6d894" : "#7a2f2f";
  const hasMultipleEntries = totalEntries > 1;

  const handleNavigate = (direction: "next" | "prev") => {
    setCurrentEntryIndex((prev) => {
      const delta = direction === "next" ? 1 : -1;
      const nextIndex = prev + delta;

      if (nextIndex < 0) return totalEntries - 1;
      if (nextIndex >= totalEntries) return 0;

      return nextIndex;
    });
  };

  return (
    <Tooltip
      openDelay={100}
      placement="bottom-start"
      isOpen={isOpen}
      bgColor="#3e1818"
      color="white"
      border="1px solid rgba(209,167,86,0.35)"
      borderRadius="lg"
      dropShadow="lg"
      pointerEvents="auto"
      maxW="400px"
      minW="400px"
      label={
        <Box
          w="full"
          pointerEvents="auto"
          onMouseEnter={() => {
            setHoveredTooltip(true);
            clearCloseTimer();
            if (setActiveMarkerId) setActiveMarkerId(id);
            else setLocalActive(true);
          }}
          onMouseLeave={() => {
            setHoveredTooltip(false);
            if (!hoveredMarker) {
              scheduleClose();
            }
          }}
        >
          {hasMultipleEntries && (
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="xs" color="bg.500">
                {`Обменник ${currentEntryIndex + 1} из ${totalEntries}`}
              </Text>
              <HStack>
                <IconButton
                  aria-label="Previous exchanger"
                  icon={<FiChevronLeft />}
                  size="xs"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    handleNavigate("prev");
                  }}
                />
                <IconButton
                  aria-label="Next exchanger"
                  icon={<FiChevronRight />}
                  size="xs"
                  variant="ghost"
                  onClick={(event) => {
                    event.stopPropagation();
                    event.preventDefault();
                    handleNavigate("next");
                  }}
                />
              </HStack>
            </HStack>
          )}
          <MarkerTooltipContent
            exchanger={currentEntry.exchanger}
            office={currentEntry.office}
          />
        </Box>
      }
    >
      <Box
        position="relative"
        w="4"
        h="4"
        borderRadius="50%"
        p="1"
        cursor="pointer"
        onMouseEnter={() => {
          openMarker();
        }}
        onMouseLeave={() => {
          setHoveredMarker(false);
          if (!hoveredTooltip) {
            scheduleClose();
          }
        }}
        onClick={(event) => {
          event.stopPropagation();
          openMarker();
        }}
        onBlur={() => {
          if (!hoveredTooltip && !hoveredMarker) {
            scheduleClose();
          }
        }}
      >
        <Box bottom="2" left="-4" color={pinColor} position="absolute">
          <FaLocationPin
            size="3rem"
            style={{ filter: "drop-shadow(0 4px 10px rgba(204, 55, 55, 0.4))" }}
          />
        </Box>
        <Box
          position="absolute"
          w="4"
          h="4"
          bg="#3e1818"
          borderRadius="50%"
          mb="2"
          bottom="5"
          right="0"
        />
        {/* <Center
          transform="translateX(-50%)"
          bottom="46px"
          left="20%"
          position="absolute"
        >
          {primaryExchanger.logo ? (
            <Box borderRadius="50%" overflow="hidden">
              <CustomImage img={primaryExchanger.logo} w="30px" h="30px" />
            </Box>
          ) : (
     
          )}
        </Center> */}
      </Box>
    </Tooltip>
  );
};

export default memo(CustomMarker);
