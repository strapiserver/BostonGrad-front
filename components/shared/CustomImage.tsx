import { Image, Box, useBreakpointValue, BoxProps } from "@chakra-ui/react";
import React from "react";
import { IImage } from "../../types/selector";
import { cmsLinkPROD, cmsLinkDEV } from "../../services/utils";

type ImageQualityMode = "low" | "medium" | "high";
type ImageQualityBreakpoints = Partial<
  Record<"base" | "sm" | "md" | "lg" | "xl" | "2xl", ImageQualityMode>
>;

const FALLBACK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const resolveVariantUrl = (
  img?: IImage | null,
  qualityMode: ImageQualityMode = "high",
) => {
  if (!img?.url) return img?.url;

  let formats: IImage["formats"] | undefined = img.formats;
  if (typeof img.formats === "string") {
    try {
      formats = JSON.parse(img.formats);
    } catch {
      formats = undefined;
    }
  }
  const fromFormats =
    qualityMode === "low"
      ? formats?.small?.url || formats?.thumbnail?.url || null
      : qualityMode === "medium"
        ? formats?.medium?.url || formats?.small?.url || null
        : img?.url;
  if (fromFormats) return fromFormats;

  // Fallback for older cached payloads without `formats`.
  if (img.url.startsWith("/uploads/") && qualityMode !== "high") {
    const filename = img.url.replace("/uploads/", "");
    if (qualityMode === "medium") return `/uploads/medium_${filename}`;
    return `/uploads/small_${filename}`;
  }

  return img.url;
};

const CustomImage = ({
  img,
  w = "200px",
  h = "200px",
  shaded = false,
  customAlt = "",
  objectFit = "cover",
  lowQualityOnMobile = false,
  adaptiveQuality = false,
  adaptiveQualityBreakpoints,
  ...boxProps
}: {
  img?: IImage | null;
  w?: string;
  h?: string;
  shaded?: boolean;
  customAlt?: string;
  objectFit?: "cover" | "contain";
  lowQualityOnMobile?: boolean;
  adaptiveQuality?: boolean;
  adaptiveQualityBreakpoints?: ImageQualityBreakpoints;
} & BoxProps) => {
  const env = process.env.NODE_ENV;
  const SRC = env === "production" ? cmsLinkPROD : cmsLinkDEV;
  const qualityMode = useBreakpointValue<ImageQualityMode>(
    adaptiveQualityBreakpoints || {
      base: "high",
      md: "medium",
      lg: "high",
    },
  );

  const resolvedImageUrl = adaptiveQuality
    ? resolveVariantUrl(img, qualityMode || "high")
    : lowQualityOnMobile
      ? resolveVariantUrl(img, qualityMode === "high" ? "high" : "low")
      : img?.url;

  const imageSrc = resolvedImageUrl
    ? resolvedImageUrl.startsWith("http")
      ? resolvedImageUrl
      : `${SRC}${resolvedImageUrl}`
    : FALLBACK_IMAGE;
  const imageKey = `${img?.id || "fallback"}-${qualityMode || "high"}-${adaptiveQuality ? "adaptive" : "default"}`;
  const imageWidth = w === "auto" ? "auto" : "100%";
  const imageHeight = h === "auto" ? "auto" : "100%";

  return (
    <Box w={w} h={h} maxW={w} maxH={h} overflow="hidden" {...boxProps}>
      <Image
        key={imageKey}
        w={imageWidth}
        h={imageHeight}
        objectFit={objectFit}
        fit={objectFit}
        filter={shaded ? "grayscale(0.6) brightness(0.3)" : "none"}
        src={imageSrc}
        data-quality-mode={qualityMode || "high"}
        data-image-src={resolvedImageUrl || ""}
        alt={img?.alternativeText || customAlt}
      />
    </Box>
  );
};

export default CustomImage;
