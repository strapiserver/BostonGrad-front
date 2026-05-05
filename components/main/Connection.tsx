import { Box, HStack, Link, Text } from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLink,
  FaTelegramPlane,
  FaVk,
  FaWhatsapp,
} from "react-icons/fa";
import { IconType } from "react-icons";
import { IImage } from "../../types/selector";
import CustomImage from "../shared/CustomImage";
import { palette } from "./program_modules/shared";
import { fbqTrackCustom } from "../../services/metaPixel";

type SocialNetworkItem = {
  name: string;
  icon: IImage | null;
  url: string;
};

type ConnectionProps = {
  socialNetworks?: SocialNetworkItem[] | null;
};

const email = "info@bostongrad.com";

const connectionGlowPulse = keyframes`
  0%, 100% {
    box-shadow:
      0 14px 30px rgba(79,16,18,0.14),
      0 0 0 3px ${palette.gold500},
      0 0 0 9px rgba(235,205,143,0.32),
      0 0 28px 8px rgba(235,205,143,0.44);
  }
  50% {
    box-shadow:
      0 14px 30px rgba(79,16,18,0.14),
      0 0 0 3px ${palette.gold500},
      0 0 0 12px rgba(235,205,143,0.48),
      0 0 42px 14px rgba(235,205,143,0.68);
  }
`;

const normalizeUrl = (value?: string | null) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/i.test(trimmed)) return trimmed;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return `mailto:${trimmed}`;
  return `https://${trimmed}`;
};

const getFallbackIcon = (name: string, href: string): IconType => {
  const value = `${name} ${href}`.toLowerCase();
  if (value.includes("telegram") || value.includes("t.me"))
    return FaTelegramPlane;
  if (value.includes("whatsapp") || value.includes("wa.me")) return FaWhatsapp;
  if (
    value.includes("facebook") ||
    value.includes("messenger") ||
    value.includes("m.me")
  ) {
    return FaFacebookF;
  }
  if (value.includes("instagram")) return FaInstagram;
  if (value.includes("vk.com") || value.includes("вк") || value.includes("vk"))
    return FaVk;
  if (value.includes("mailto:") || value.includes("email")) return FaEnvelope;
  return FaLink;
};

const getContactClickEvent = (name: string, href: string) => {
  const value = `${name} ${href}`.toLowerCase();
  if (value.includes("telegram") || value.includes("t.me")) return "ClickTelegram";
  if (value.includes("whatsapp") || value.includes("wa.me")) return "ClickWhatsApp";
  return "";
};

const getTelegramFallbackUrl = () => {
  const botUrl = normalizeUrl(process.env.NEXT_PUBLIC_TELEGRAM_BOT);
  if (botUrl) return botUrl;

  const botUsername = String(process.env.NEXT_PUBLIC_BOT_USERNAME || "").trim();
  return botUsername
    ? `https://t.me/${botUsername.replace(/^@/, "")}`
    : "https://t.me";
};

const getDefaultLinks = () => [
  {
    label: "Telegram",
    href: getTelegramFallbackUrl(),
    cmsIcon: null,
  },
  {
    label: "WhatsApp",
    href:
      normalizeUrl(process.env.NEXT_PUBLIC_WHATSAPP_BOT_URL) || "https://wa.me",
    cmsIcon: null,
  },
  {
    label: "Facebook",
    href: normalizeUrl(process.env.NEXT_PUBLIC_FACEBOOK_BOT_URL) || "https://m.me",
    cmsIcon: null,
  },
  {
    label: "Email",
    href: `mailto:${email}`,
    cmsIcon: null,
  },
];

const getConnectionLinks = (socialNetworks?: SocialNetworkItem[] | null) => {
  const cmsLinks = (socialNetworks || [])
    .map((network) => {
      const label = String(network.name || "").trim();
      const href = normalizeUrl(network.url);
      if (!label || !href) return null;
      return {
        label,
        href,
        cmsIcon: network.icon || null,
      };
    })
    .filter(
      (item): item is { label: string; href: string; cmsIcon: IImage | null } =>
        Boolean(item),
    );

  const merged = cmsLinks.length ? cmsLinks : getDefaultLinks();
  const hasEmail = merged.some(({ label, href }) => {
    const value = `${label} ${href}`.toLowerCase();
    return value.includes("email") || value.includes("mailto:");
  });

  const withEmail = hasEmail
    ? merged
    : [...merged, { label: "Email", href: `mailto:${email}`, cmsIcon: null }];

  return withEmail
    .filter((item, index, items) => {
      const key = `${item.label.toLowerCase()}|${item.href.toLowerCase()}`;
      return (
        items.findIndex(
          (candidate) =>
            `${candidate.label.toLowerCase()}|${candidate.href.toLowerCase()}` ===
            key,
        ) === index
      );
    })
    .sort((a, b) => {
      const aEmail = a.href.startsWith("mailto:");
      const bEmail = b.href.startsWith("mailto:");
      if (aEmail === bEmail) return 0;
      return aEmail ? 1 : -1;
    });
};

export default function Connection({ socialNetworks }: ConnectionProps) {
  const links = getConnectionLinks(socialNetworks);

  return (
    <Box
      w="100%"
      mt={{ base: "2", md: "3" }}
      position="relative"
      isolation="isolate"
      overflow="visible"
    >
      <HStack
        as="section"
        aria-label="Связаться с нами"
        w="100%"
        minH={{ base: "68px", md: "64px" }}
        px={{ base: "4", md: "6" }}
        py={{ base: "4", md: "3" }}
        borderRadius="16px"
        bg={`linear-gradient(135deg, #fff1c9 0%, ${palette.gold400} 100%)`}
        border="1px solid rgba(79,16,18,0.14)"
        boxShadow={`0 14px 30px rgba(79,16,18,0.14), 0 0 0 3px ${palette.gold500}, 0 0 0 10px rgba(235,205,143,0.38), 0 0 34px 10px rgba(235,205,143,0.58)`}
        animation={`${connectionGlowPulse} 2.4s ease-in-out infinite`}
        willChange="box-shadow"
        position="relative"
        zIndex={1}
        justify={{ base: "center", md: "space-between" }}
        align="center"
        spacing={{ base: "3", md: "5" }}
        flexWrap={{ base: "wrap", md: "nowrap" }}
      >
        <Text
          color={palette.wine900}
          fontSize={{ base: "xl", md: "2xl" }}
          fontWeight="900"
          lineHeight="1.1"
          textAlign={{ base: "center", md: "left" }}
        >
          Связаться с нами
        </Text>

        <HStack
          spacing="2.5"
          flexWrap="wrap"
          justify={{ base: "center", md: "end" }}
        >
          {links.map(({ label, href, cmsIcon }) => {
            const Icon = getFallbackIcon(label, href);
            const isExternal = !href.startsWith("mailto:");
            const clickEvent = getContactClickEvent(label, href);

            return (
              <Link
                key={`${label}-${href}`}
                href={href}
                onClick={() => {
                  if (!clickEvent) return;
                  fbqTrackCustom(clickEvent, {
                    source: "connection",
                    label,
                    url: href,
                  });
                }}
                isExternal={isExternal}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                aria-label={label}
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                w="51px"
                h="51px"
                color={palette.wine900}
                opacity={0.92}
                transition="opacity 160ms ease, transform 160ms ease"
                _hover={{
                  opacity: 1,
                  transform: "translateY(-2px)",
                }}
                _active={{ transform: "translateY(0)" }}
              >
                {cmsIcon ? (
                  <Box
                    w="42px"
                    h="42px"
                    position="relative"
                    zIndex={1}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      img: {
                        filter:
                          "brightness(0) saturate(100%) invert(13%) sepia(37%) saturate(2399%) hue-rotate(330deg) brightness(86%) contrast(94%)",
                      },
                    }}
                  >
                    <CustomImage
                      img={cmsIcon}
                      w="42px"
                      h="42px"
                      objectFit="contain"
                      customAlt={label}
                    />
                  </Box>
                ) : (
                  <Box as="span" position="relative" zIndex={1} display="flex">
                    <Icon size="2.18rem" />
                  </Box>
                )}
              </Link>
            );
          })}
        </HStack>
      </HStack>
    </Box>
  );
}
