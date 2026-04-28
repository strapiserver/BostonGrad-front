import React, { useEffect, useRef, useState } from "react";
import { StaticImageData } from "next/image";
import { Box3D } from "../../../styles/theme/custom";
import { useColorModeValue, Box, useBreakpointValue } from "@chakra-ui/react";

export default function Advantage({
  children,
  imageSrc,
  alt,
}: {
  children: (hovering: boolean) => React.ReactNode;
  imageSrc: StaticImageData;
  alt: string;
}) {
  const ambientColor = useColorModeValue(
    "rgba(143,92,292,0.2)",
    "rgba(247, 197, 177, 0.1)"
  );

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useBreakpointValue({ base: true, lg: false });

  useEffect(() => {
    const node = containerRef.current;
    if (!node || typeof window === "undefined" || !isMobile) return;

    let rafId: number | null = null;
    const checkVisible = () => {
      rafId = null;
      const rect = node.getBoundingClientRect();
      const viewportMid = window.innerHeight * 0.5;
      const visible = rect.top <= viewportMid && rect.bottom >= viewportMid;
      setIsVisible(visible);
    };

    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(checkVisible);
    };

    checkVisible();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [isMobile]);

  const isActive = isMobile ? isVisible : isHovered;

  return (
    <Box ref={containerRef} w="100%">
      <Box3D
        h={{ base: "auto", lg: "220px" }}
        flex="1"
        w={{ base: "calc(100% - 32px)", lg: "360px" }}
        mx="16px"
        variant="contrast"
        position="relative"
        overflow="hidden"
        filter={isActive ? "brightness(1.05)" : "brightness(1)"}
        _hover={{ filter: "brightness(1.1)" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Box
          position="absolute"
          inset={0}
          zIndex={0}
          pointerEvents="none"
          bgGradient={`radial-gradient(circle at 50% -10%, ${ambientColor} 0%, transparent 40%)`}
          opacity={1}
          h="300px"
        />
        <Box position="relative" zIndex={1}>
          <Box as="img" alt={alt} src={imageSrc.src} w="100%" h="auto" />

          {children(isActive)}
        </Box>
      </Box3D>
    </Box>
  );
}
