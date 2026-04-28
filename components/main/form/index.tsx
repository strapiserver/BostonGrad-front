import { Box, Button, Grid, Input, Text, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { RiSendPlaneFill } from "react-icons/ri";
import {
  RiChat1Line,
  RiListSettingsLine,
  RiMailLine,
  RiMapPin2Line,
  RiUser3Line,
} from "react-icons/ri";
import CustomSelect from "../../shared/CustomSelect";
import { IImage } from "../../../types/selector";
import settings from "./settings.json";
import { FormEvent, useState } from "react";

const { fieldCommon } = settings;
const { placeholderColor, ...fieldCommonInputStyles } = fieldCommon;
const fieldIconColor = "#5a2a2a";
const fieldIconSize = 22;

export default function Forms({
  countries = [],
  socialNetworks = [],
  title = "Запишитесь на летнюю программу:",
}: {
  countries?: { id: string; name: string }[];
  socialNetworks?: { name: string; icon: IImage | null; url: string }[];
  title?: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitCooldownMs = 20_000;
  const ageOptions = [
    { value: "12", label: "до 14" },
    { value: "16", label: "14-17" },
    { value: "20", label: "18-22" },
    { value: "23", label: "22+" },
  ];
  const countryOptions = countries.map((country) => ({
    value: country.id,
    label: country.name,
  }));
  const socialNetworkOptions = socialNetworks.map((network) => ({
    value: network.url,
    label: network.name,
    icon: network.icon,
  }));

  const getSocialChannel = (networkName: string, networkUrl: string) => {
    const name = String(networkName || "").toLowerCase();
    const url = String(networkUrl || "").toLowerCase();
    if (name.includes("email") || url.startsWith("mailto:")) return "email";
    if (name.includes("instagram") || name.includes("инст")) return "instagram";
    if (name === "vk" || name.includes("вк") || url.includes("vk.com")) return "vk";
    if (name.includes("telegram") || url.includes("t.me")) return "telegram";
    if (name.includes("whatsapp") || url.includes("wa.me") || url.includes("whatsapp")) {
      return "whatsapp";
    }
    if (name.includes("facebook") || url.includes("m.me") || url.includes("facebook.com")) {
      return "facebook";
    }
    return "other";
  };

  const normalizeExternalUrl = (value: string) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const withTelegramStartCode = (url: string, startCode?: string) => {
    if (!startCode) return url;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      if (host !== "t.me" && host !== "telegram.me" && !host.endsWith(".t.me")) {
        return url;
      }
      parsed.searchParams.set("start", startCode);
      return parsed.toString();
    } catch {
      return url;
    }
  };

  const withWhatsAppStartCode = (url: string, startCode?: string) => {
    if (!startCode) return url;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      const isWhatsapp =
        host === "wa.me" ||
        host === "api.whatsapp.com" ||
        host.endsWith(".whatsapp.com");
      if (!isWhatsapp) return url;
      const existing = parsed.searchParams.get("text");
      const prefix = existing ? `${existing}\n` : "";
      parsed.searchParams.set("text", `${prefix}START ${startCode}`);
      return parsed.toString().replace(/\+/g, "%20");
    } catch {
      return url;
    }
  };

  const withFacebookStartCode = (url: string, startCode?: string) => {
    if (!startCode) return url;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      const isMessenger =
        host === "m.me" ||
        host === "www.m.me" ||
        host.endsWith(".facebook.com") ||
        host === "messenger.com" ||
        host.endsWith(".messenger.com");
      if (!isMessenger) return url;
      parsed.searchParams.set("ref", startCode);
      return parsed.toString();
    } catch {
      return url;
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const kidAgeRaw = String(formData.get("kid_age") || "").trim();
    const country = String(formData.get("country") || "").trim();
    const honeypot = String(formData.get("contact_time") || "").trim();
    const socialNetworkUrlRaw = String(formData.get("socialnetwork") || "").trim();
    const socialNetworkUrl = normalizeExternalUrl(socialNetworkUrlRaw);
    const selectedNetwork = socialNetworks.find(
      (item) => normalizeExternalUrl(item.url) === socialNetworkUrl,
    );
    const selectedChannel = getSocialChannel(
      selectedNetwork?.name || "",
      selectedNetwork?.url || socialNetworkUrl,
    );

    if (!socialNetworkUrl) {
      setError("Выберите социальную сеть");
      return;
    }
    if (!kidAgeRaw) {
      setError("Выберите возраст ребенка");
      return;
    }
    if (!name || !email || !country) {
      return;
    }

    if (typeof window !== "undefined") {
      const lastSubmitTs = Number(window.localStorage.getItem("lead_submit_ts") || "0");
      if (Date.now() - lastSubmitTs < submitCooldownMs) {
        setError("Подождите немного перед повторной отправкой");
        return;
      }
    }

    if (typeof window !== "undefined") {
      const noBotChannel =
        selectedChannel === "email" || selectedChannel === "instagram" || selectedChannel === "vk";
      if (noBotChannel) {
        const params = new URLSearchParams({
          channel: selectedChannel,
          target: socialNetworkUrl,
          name,
          email,
          kid_age: kidAgeRaw,
          country,
        });
        window.location.href = `/quiz?${params.toString()}`;
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/lead-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          kid_age: Number(kidAgeRaw),
          country,
          honeypot,
        }),
      });
      if (!response.ok) {
        throw new Error("Lead submit failed");
      }
      const payload = (await response.json()) as {
        leadStartCode?: string;
        telegramStartCode?: string;
      };
      if (typeof window !== "undefined") {
        window.localStorage.setItem("lead_submit_ts", String(Date.now()));
      }
      if (typeof window !== "undefined") {
        const startCode = payload?.leadStartCode || payload?.telegramStartCode;
        const targetUrl = withFacebookStartCode(
          withWhatsAppStartCode(
            withTelegramStartCode(socialNetworkUrl, startCode),
            startCode,
          ),
          startCode,
        );
        window.location.href = targetUrl;
      }
    } catch {
      setError("Не удалось открыть чат. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box w="100%" as="form" onSubmit={onSubmit} textTransform="none">
      <Text
        color="#f6d894"
        fontSize={{ base: "2xl", md: "4xl" }}
        fontWeight="700"
        lineHeight="1.15"
        mb={{ base: "4", md: "3" }}
        textShadow="0 0 14px rgba(246,216,148,0.35)"
      >
        {title}
      </Text>
      <Grid
        w="100%"
        gap={{ base: "3", md: "4" }}
        mt="4"
        gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
      >
        <InputGroup>
          <InputLeftElement h={{ base: "52px", md: "56px" }} color={fieldIconColor}>
            <RiUser3Line size={fieldIconSize} />
          </InputLeftElement>
          <Input
            type="text"
            name="name"
            borderRadius="lg"
            placeholder="Ваше имя"
            required
            h={{ base: "52px", md: "56px" }}
            pl="10"
            fontSize={{ base: "md", md: "2xl" }}
            bg="white"
            color="#2d1a1a"
            borderColor="rgba(255,255,255,0.65)"
            _hover={{ borderColor: "rgba(255,255,255,0.9)" }}
            _focus={{
              borderColor: "#f6d894",
              boxShadow: "0 0 0 1px rgba(246,216,148,0.9)",
            }}
            _placeholder={{ color: "rgba(45,26,26,0.6)" }}
          />
        </InputGroup>
        <Input
          type="text"
          name="contact_time"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          position="absolute"
          left="-9999px"
          top="-9999px"
          h="0"
          p="0"
          opacity={0}
        />

        {/* <FormLabel>Возраст ребенка</FormLabel> */}
        <CustomSelect
          name="kid_age"
          placeholder="Возраст ребенка"
          autoSelectFirst={false}
          h={{ base: "52px", md: "56px" }}
          fontSize={{ base: "md", md: "2xl" }}
          options={ageOptions}
          leftIcon={<RiListSettingsLine color={fieldIconColor} size={fieldIconSize} />}
          bg="white"
          color="#2d1a1a"
          borderColor="rgba(255,255,255,0.65)"
          _hover={{ borderColor: "rgba(255,255,255,0.9)" }}
          _focus={{
            borderColor: "#f6d894",
            boxShadow: "0 0 0 1px rgba(246,216,148,0.9)",
          }}
        />

        {/* <FormLabel>Страна</FormLabel> */}
        <CustomSelect
          name="country"
          placeholder="Страна"
          options={countryOptions}
          autoSelectFirst={false}
          h={{ base: "52px", md: "56px" }}
          fontSize={{ base: "md", md: "2xl" }}
          leftIcon={<RiMapPin2Line color={fieldIconColor} size={fieldIconSize} />}
          bg="white"
          color="#2d1a1a"
          borderColor="rgba(255,255,255,0.65)"
          _hover={{ borderColor: "rgba(255,255,255,0.9)" }}
          _focus={{
            borderColor: "#f6d894",
            boxShadow: "0 0 0 1px rgba(246,216,148,0.9)",
          }}
        />

        <CustomSelect
          name="socialnetwork"
          placeholder="Способ связи"
          options={socialNetworkOptions}
          autoSelectFirst={false}
          h={{ base: "52px", md: "56px" }}
          fontSize={{ base: "md", md: "2xl" }}
          leftIcon={<RiChat1Line color={fieldIconColor} size={fieldIconSize} />}
          showSelectedIcon={false}
          bg="white"
          color="#2d1a1a"
          borderColor="rgba(255,255,255,0.65)"
          _hover={{ borderColor: "rgba(255,255,255,0.9)" }}
          _focus={{
            borderColor: "#f6d894",
            boxShadow: "0 0 0 1px rgba(246,216,148,0.9)",
          }}
        />
        <InputGroup>
          <InputLeftElement h={{ base: "52px", md: "56px" }} color={fieldIconColor}>
            <RiMailLine size={fieldIconSize} />
          </InputLeftElement>
          <Input
            type="email"
            name="email"
            borderRadius="lg"
            placeholder="Email"
            required
            h={{ base: "52px", md: "56px" }}
            pl="10"
            fontSize={{ base: "md", md: "2xl" }}
            bg="white"
            color="#2d1a1a"
            borderColor="rgba(255,255,255,0.65)"
            _hover={{ borderColor: "rgba(255,255,255,0.9)" }}
            _focus={{
              borderColor: "#f6d894",
              boxShadow: "0 0 0 1px rgba(246,216,148,0.9)",
            }}
            _placeholder={{ color: "rgba(45,26,26,0.6)" }}
          />
        </InputGroup>

        <Button
          size="md"
          h={{ base: "48px", md: "50px" }}
          fontSize={{ base: "lg", md: "2xl" }}
          bgGradient="linear(to-r, #f6d894 0%, #eebc57 100%)"
          color="#4a1c1c"
          _hover={{ filter: "brightness(1.03)" }}
          _active={{ filter: "brightness(0.98)" }}
          w="100%"
          rightIcon={<RiSendPlaneFill />}
          type="submit"
          isLoading={isSubmitting}
        >
          Отправить
        </Button>
        {error ? (
          <Text gridColumn="1 / -1" color="red.300" fontSize="sm" textTransform="none">
            {error}
          </Text>
        ) : null}
      </Grid>
    </Box>
  );

  return (
    <Box w="100%">
    </Box>
  );
}
