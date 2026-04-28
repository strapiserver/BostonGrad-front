import { Box, Tooltip } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { FaInstagram } from "react-icons/fa";
import { MdDevices } from "react-icons/md";
import {
  TiVendorApple,
  TiVendorAndroid,
  TiVendorMicrosoft,
} from "react-icons/ti";

type PlatformMeta = {
  keywords: string[];
  icon: IconType;
  color: string;
  label: string;
};

const PLATFORM_META: PlatformMeta[] = [
  {
    keywords: ["windows", "win64", "win32"],
    icon: TiVendorMicrosoft,
    color: "blue.500",
    label: "Windows",
  },
  {
    keywords: ["android"],
    icon: TiVendorAndroid,
    color: "green.500",
    label: "Android",
  },
  {
    keywords: ["iphone", "ipad", "ios", "mac os", "macos", "macintosh"],
    icon: TiVendorApple,
    color: "gray.200",
    label: "Apple",
  },

  {
    keywords: ["instagram"],
    icon: FaInstagram,
    color: "pink.500",
    label: "Instagram",
  },
];

const getPlatformMeta = (userAgent: string): PlatformMeta | null => {
  const normalized = userAgent.toLowerCase();
  return (
    PLATFORM_META.find((meta) =>
      meta.keywords.some((keyword) => normalized.includes(keyword)),
    ) || null
  );
};

const UserAgent = ({ userAgent }: { userAgent?: string | null }) => {
  if (!userAgent) return null;

  const platformMeta = getPlatformMeta(userAgent);
  const IconComponent = platformMeta?.icon || MdDevices;
  const color = platformMeta?.color || "gray.700";
  const iconColor = platformMeta?.color === "gray.200" ? "gray.700" : "white";
  const label =
    platformMeta?.label || userAgent.split(/[\/;\(\)]/)[0].trim() || "Device";

  return (
    <Tooltip label={label} hasArrow>
      <Box
        borderRadius="full"
        bg={color}
        color={iconColor}
        p="1"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        aria-label={label}
      >
        <IconComponent size="1rem" />
      </Box>
    </Tooltip>
  );
};

export default UserAgent;
