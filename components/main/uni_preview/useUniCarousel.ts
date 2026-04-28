import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { ScrollDirection } from "./types";

const getCardScrollDelta = (node: HTMLDivElement) => {
  const uniCard = node.querySelector("[data-uni-idx]") as HTMLElement | null;
  return uniCard ? uniCard.offsetWidth + 16 : node.clientWidth * 0.8;
};

export const useUniCarousel = (unisLength = 0) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef({ isDown: false, startX: 0, startLeft: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const scrollByCard = (direction: ScrollDirection) => {
    const node = scrollRef.current;
    if (!node) return;

    const deltaBase = getCardScrollDelta(node);
    const delta = direction === "left" ? -deltaBase : deltaBase;
    node.scrollBy({ left: delta, behavior: "smooth" });
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = scrollRef.current;
    if (!node) return;

    dragState.current = {
      isDown: true,
      startX: e.clientX,
      startLeft: node.scrollLeft,
    };
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const node = scrollRef.current;
    if (!node || !dragState.current.isDown) return;

    const dx = e.clientX - dragState.current.startX;
    node.scrollLeft = dragState.current.startLeft - dx;
  };

  const onMouseUpOrLeave = () => {
    dragState.current.isDown = false;
    setIsDragging(false);
  };

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !unisLength) return;

    const centerIndex = Math.floor((unisLength - 1) / 2);

    const centerToTarget = () => {
      const target = node.querySelector(
        `[data-uni-idx="${centerIndex}"]`,
      ) as HTMLElement | null;
      if (!target) return;

      const targetCenter = target.offsetLeft + target.offsetWidth / 2;
      const left = targetCenter - node.clientWidth / 2;
      node.scrollTo({ left, behavior: "smooth" });
    };

    const t1 = window.setTimeout(centerToTarget, 0);
    const t2 = window.setTimeout(centerToTarget, 120);
    window.addEventListener("resize", centerToTarget);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", centerToTarget);
    };
  }, [unisLength]);

  return {
    isDragging,
    onMouseDown,
    onMouseMove,
    onMouseUpOrLeave,
    scrollByCard,
    scrollRef,
  };
};
