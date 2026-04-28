import { Box, Button, HStack, VStack } from "@chakra-ui/react";
import { firstItems, secondItems, thirdItems } from "./items";
import MassSwiper from "./massSwiper";
import { FaSearch } from "react-icons/fa";
import { useCallback, useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { setMassSelectorSlug } from "../../../redux/mainReducer";
import { readSlug } from "./helper";
import { ResponsiveText } from "../../../styles/theme/custom";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import type { MassSwiperHandle } from "./massSwiper";
import { LinkWrapper } from "../../shared/LinkWrapper";

const MassSelector = () => {
  // const massSelectorSlug = initialSlug
  //   ? ""
  //   : useAppSelector((state) => state.main.massSelectorSlug);
  const dispatch = useAppDispatch();

  let f = "";
  let s = "";
  let t = "";

  // ✅ fallback to first items, not index 0 hardcoded
  f = firstItems[0]?.id ?? "";
  s = secondItems[0]?.id ?? "";
  t = thirdItems[0]?.id ?? "";

  const [first, setFirst] = useState(f);
  const [second, setSecond] = useState(s);
  const [third, setThird] = useState(t);

  const slug = `/${first}/${second}-for-${third}`;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const firstRef = useRef<MassSwiperHandle>(null);
  const secondRef = useRef<MassSwiperHandle>(null);
  const thirdRef = useRef<MassSwiperHandle>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isSequenceRunningRef = useRef(false);
  const autoTriggeredRef = useRef(false);

  const clearSequence = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    isSequenceRunningRef.current = false;
  }, []);

  const runSequence = useCallback(
    (direction: "up" | "down") => {
      if (isSequenceRunningRef.current) return;
      clearSequence();
      isSequenceRunningRef.current = true;
      const refs = [firstRef, secondRef, thirdRef];
      const method: keyof MassSwiperHandle =
        direction === "up" ? "stepDown" : "stepUp";

      refs.forEach((ref, idx) => {
        const timeoutId = setTimeout(() => {
          ref.current?.[method]?.();
          if (idx === refs.length - 1) {
            isSequenceRunningRef.current = false;
            timeoutsRef.current = [];
          }
        }, idx * 100);
        timeoutsRef.current.push(timeoutId);
      });
    },
    [clearSequence],
  );

  const checkCentered = useCallback(() => {
    if (autoTriggeredRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const centerInside =
      rect.top <= viewportCenter && rect.bottom >= viewportCenter;
    if (centerInside) {
      autoTriggeredRef.current = true;
      runSequence("down");
    }
  }, [runSequence]);

  useEffect(() => {
    checkCentered();
    window.addEventListener("scroll", checkCentered, { passive: true });
    window.addEventListener("resize", checkCentered);

    return () => {
      window.removeEventListener("scroll", checkCentered);
      window.removeEventListener("resize", checkCentered);
    };
  }, [checkCentered]);

  useEffect(() => {
    return () => {
      clearSequence();
    };
  }, [clearSequence]);

  return (
    <VStack
      gap={"2"}
      w="100%"
      position="relative"
      ref={containerRef}
      mb={{ base: 8, lg: 16 }}
    >
      <VStack
        left="-60px"
        position="absolute"
        sx={{ top: "calc(50% - 70px )" }}
        color="bg.800"
        h="140px"
        justifyContent={"space-between"}
      >
        <Button
          variant="ghost"
          size="xs"
          h="20px"
          color="inherit"
          onClick={() => runSequence("up")}
        >
          <MdOutlineKeyboardArrowUp size="1.5rem" />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          h="20px"
          justifySelf="end"
          color="inherit"
          onClick={() => runSequence("down")}
        >
          <MdOutlineKeyboardArrowDown size="1.5rem" />
        </Button>
      </VStack>

      <HStack w="100%" justifyContent="center">
        <MassSwiper
          ref={firstRef}
          initialId={first}
          items={firstItems}
          set={setFirst}
        />
        <MassSwiper
          ref={secondRef}
          initialId={second}
          items={secondItems}
          set={setSecond}
        />
        <MassSwiper
          ref={thirdRef}
          initialId={third}
          items={thirdItems}
          set={setThird}
        />
      </HStack>
      {/* MOBILE */}
      <Box display={{ base: "none", lg: "block" }}>
        <LinkWrapper url={slug}>
          <Button
            color="white"
            variant="primary"
            position="absolute"
            h="50px"
            sx={{ top: "calc(50% - 28px )" }}
            right="-80px"
            onClick={() => dispatch(setMassSelectorSlug(slug))}
          >
            <FaSearch size="1.5rem" />
          </Button>
        </LinkWrapper>
      </Box>

      {/* DESKTOP */}
      <Box display={{ base: "block", lg: "none" }}>
        <NextLink href={slug}>
          <Button
            mt={"6"}
            variant="primary"
            size="sm"
            onClick={() => dispatch(setMassSelectorSlug(slug))}
          >
            <HStack color="white">
              <ResponsiveText color="inherit" size="xl">
                Искать школу
              </ResponsiveText>
              <FaSearch size="1.5rem" />
            </HStack>
          </Button>
        </NextLink>
      </Box>
    </VStack>
  );
};

export default MassSelector;
