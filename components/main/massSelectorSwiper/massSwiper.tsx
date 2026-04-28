import { useColorModeValue, Box, useTheme, Text } from "@chakra-ui/react";
import { useMotionValue, useAnimation, motion } from "framer-motion";
import React, { forwardRef, useImperativeHandle } from "react";
import { ResponsiveText } from "../../../styles/theme/custom";
import MassShader from "../../mass/MassShader";

const [dragElastic, inertiaPower, inertiaTimeConstant] = [0.1, 0.4, 240];

type MassSwiperProps = {
  initialId?: string;
  set: Function;
  items: { id: string; ru_label: string; en_label: string }[];
};

const MassSwiper = forwardRef<MassSwiperHandle, MassSwiperProps>(
  ({ initialId, items, set }, ref) => {
    const isMobile = false;
    const itemHeight = 40;
    const containerHeight = 120;

    const length = items.length;
    const bgColor = useColorModeValue("bg.50", "bg.800");
    const [mouseEntered, setMouseEntered] = React.useState(false);
    const originalOverflowRef = React.useRef<string | null>(null);
    const originalPaddingRef = React.useRef<string | null>(null);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const y = useMotionValue(0);
    const controls = useAnimation();
    const theme = useTheme();
    const lastSelectedIdRef = React.useRef<string | null>(null);

    const parseSpaceToPx = React.useCallback((val: any) => {
      if (!val && val !== 0) return 0;
      if (typeof val === "number") return val;
      const s = String(val).trim();
      if (s.endsWith("px")) return parseFloat(s);
      if (s.endsWith("rem")) {
        const root =
          typeof window !== "undefined"
            ? parseFloat(
                getComputedStyle(document.documentElement).fontSize || "16"
              )
            : 16;
        return parseFloat(s) * root;
      }
      if (s.endsWith("em")) {
        const root =
          typeof window !== "undefined"
            ? parseFloat(
                getComputedStyle(document.documentElement).fontSize || "16"
              )
            : 16;
        return parseFloat(s) * root;
      }
      const maybeNum = Number(s);
      if (!isNaN(maybeNum)) return maybeNum;
      return 0;
    }, []);

    const gapPx = parseSpaceToPx((theme as any).space?.[2] ?? 0);
    const padY = parseSpaceToPx((theme as any).space?.[4] ?? 0);
    const paddingTopPx = padY;
    const step = itemHeight + gapPx;
    const centerOffset = containerHeight / 2 - itemHeight / 2 - paddingTopPx;

    const getIndex = React.useCallback(() => {
      const index = Math.round((-y.get() + centerOffset) / step);
      return Math.min(length - 1, Math.max(0, index));
    }, [centerOffset, length, step, y]);

    const snapToNearest = React.useCallback(
      (currentY: number) => {
        const index = Math.round((-currentY + centerOffset) / step);
        if (index <= 0) return centerOffset;
        if (index >= length - 1) return -step * (length - 1) + centerOffset;
        return -index * step + centerOffset;
      },
      [centerOffset, step, length]
    );

    const move = React.useCallback(
      (yPos: number) => {
        controls.start({
          y: yPos,
          transition: { type: "tween", ease: "easeOut", duration: 0.2 },
        });
      },
      [controls]
    );

    const notifySelection = React.useCallback(
      (nextId: string) => {
        if (lastSelectedIdRef.current === nextId) return;
        lastSelectedIdRef.current = nextId;
        set(nextId);
      },
      [set]
    );

    const scrollToItem = React.useCallback(
      (index: number) => {
        const targetY = -index * step + centerOffset;
        move(targetY);
      },
      [centerOffset, move, step]
    );

    const changeIndexByDelta = React.useCallback(
      (delta: number) => {
        if (!length) return;
        const currentIndex = getIndex();
        const newIndex = Math.min(
          length - 1,
          Math.max(0, currentIndex + delta)
        );
        scrollToItem(newIndex);
      },
      [getIndex, length, scrollToItem]
    );

    const stepDown = React.useCallback(
      () => changeIndexByDelta(-1),
      [changeIndexByDelta]
    );

    const stepUp = React.useCallback(
      () => changeIndexByDelta(1),
      [changeIndexByDelta]
    );

    useImperativeHandle(
      ref,
      () => ({
        stepUp,
        stepDown,
      }),
      [stepDown, stepUp]
    );

    const restoreBodyStyles = React.useCallback(() => {
      if (typeof document === "undefined") return;
      document.body.style.overflow = originalOverflowRef.current ?? "";
      document.body.style.paddingRight = originalPaddingRef.current ?? "";
      originalOverflowRef.current = null;
      originalPaddingRef.current = null;
    }, []);

    const handleMouseEnter = React.useCallback(() => {
      if (isMobile || mouseEntered) return;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      originalOverflowRef.current = document.body.style.overflow;
      originalPaddingRef.current = document.body.style.paddingRight;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      setMouseEntered(true);
    }, [isMobile, mouseEntered]);

    const handleMouseLeave = React.useCallback(() => {
      if (isMobile) return;
      restoreBodyStyles();
      setMouseEntered(false);
    }, [isMobile, restoreBodyStyles]);

    const handleWheel = React.useCallback(
      (event: WheelEvent) => {
        const containerEl = containerRef.current;
        const targetNode = event.target as Node | null;
        const path = (event as any).composedPath?.() as Node[] | undefined;
        const targetInside =
          !!containerEl &&
          (containerEl === targetNode ||
            (!!targetNode && containerEl.contains(targetNode)) ||
            (Array.isArray(path) && path.includes(containerEl)));

        if (targetInside && !mouseEntered) {
          handleMouseEnter();
        }
        if (isMobile || !mouseEntered) return;
        if (!event.deltaY) return;
        const magnitude = Math.min(
          3,
          Math.max(1, Math.round(Math.abs(event.deltaY) / 120))
        );
        const direction = event.deltaY > 0 ? 1 : -1;
        changeIndexByDelta(direction * magnitude);
        event.preventDefault();
      },
      [changeIndexByDelta, handleMouseEnter, isMobile, mouseEntered]
    );

    const handleKeyDown = React.useCallback(
      (event: any) => {
        if (isMobile) return;
        if (event.key === "ArrowUp" || event.key === "ArrowRight") stepDown();
        else if (event.key === "ArrowDown" || event.key === "ArrowLeft")
          stepUp();
      },
      [isMobile, stepDown, stepUp]
    );

    React.useEffect(() => {
      if (isMobile) return;
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [handleKeyDown, isMobile]);

    React.useEffect(() => {
      if (length === 0) return;

      let startIndex = 0;
      if (initialId) {
        const idx = items.findIndex((it) => it.id === initialId);
        if (idx !== -1) {
          startIndex = idx;
        }
      }

      const targetY = -startIndex * step + centerOffset;

      move(targetY);

      // still notify parent which item is selected
      notifySelection(items[startIndex].id);
    }, [initialId, length, step, centerOffset, items, move, notifySelection]);

    // 3) LOG selected item whenever it changes (keeps parent in sync on interactions)
    React.useEffect(() => {
      let lastIndex = getIndex();
      notifySelection(items[lastIndex].id);

      const unsubscribe = y.onChange(() => {
        const idx = getIndex();
        if (idx !== lastIndex) {
          lastIndex = idx;
          notifySelection(items[idx].id);
        }
      });
      return unsubscribe;
    }, [y, items, centerOffset, step, getIndex, notifySelection]);

    React.useEffect(() => {
      return () => {
        restoreBodyStyles();
      };
    }, [restoreBodyStyles]);

    return (
      <Box h={`${containerHeight}px`} minW="30%">
        <Box
          cursor="grab"
          position="relative"
          overflow="hidden"
          h={`${containerHeight}px`}
          px={{ base: 0, lg: 2 }}
          py="4"
          borderRadius={`${8}% ${8}% ${8}% ${8}% / 50% 50% 50% 50%`}
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel as any}
        >
          <MassShader direction="top" />
          <motion.div
            drag="y"
            dragConstraints={{
              top: -step * (length - 1) + centerOffset,
              bottom: centerOffset,
            }}
            style={{ y, width: "100%" }}
            dragElastic={dragElastic}
            dragMomentum
            dragTransition={{
              power: inertiaPower,
              timeConstant: inertiaTimeConstant,
              modifyTarget: (target: number) => snapToNearest(target),
            }}
            onDragTransitionEnd={() => set(items[getIndex()].id)}
            animate={controls}
          >
            {items.map((item) => (
              <Box
                bgColor={bgColor}
                key={item.ru_label + item.id}
                h={`${itemHeight}px`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="lg"
                mb="2"
                fontSize={{ base: "md", lg: "2xl" }}
              >
                <Text color="bg.600" fontSize="inherit">
                  {item.ru_label}
                </Text>
              </Box>
            ))}
          </motion.div>
          <MassShader direction="bottom" />
        </Box>
      </Box>
    );
  }
);

export type MassSwiperHandle = {
  stepUp: () => void;
  stepDown: () => void;
};

export default MassSwiper;
