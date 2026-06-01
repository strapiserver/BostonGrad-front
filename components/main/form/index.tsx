import {
  Box,
  Button,
  Grid,
  Input,
  Text,
  InputGroup,
  InputLeftElement,
  useBreakpointValue,
} from "@chakra-ui/react";
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
import { fbqTrack, fbqTrackCustom } from "../../../services/metaPixel";

const { fieldCommon } = settings;
const { placeholderColor, ...fieldCommonInputStyles } = fieldCommon;
const fieldIconColor = "#5a2a2a";
const fieldIconSize = 22;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Forms({
  countries = [],
  socialNetworks = [],
  title = "Запишитесь на летнюю программу:",
}: {
  countries?: { id: string; name: string }[];
  socialNetworks?: { name: string; icon: IImage | null; url: string }[];
  title?: string;
}) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showSelectIcons = useBreakpointValue({ base: false, md: true });
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
    if (name === "vk" || name.includes("вк") || url.includes("vk.com"))
      return "vk";
    if (name.includes("telegram") || url.includes("t.me")) return "telegram";
    if (
      name.includes("whatsapp") ||
      url.includes("wa.me") ||
      url.includes("whatsapp")
    ) {
      return "whatsapp";
    }
    if (
      name.includes("facebook") ||
      url.includes("m.me") ||
      url.includes("facebook.com")
    ) {
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

  const trackContactClick = (
    channel: string,
    url: string,
    source = "lead_form",
  ) => {
    if (channel === "telegram") {
      fbqTrackCustom("ClickTelegram", {
        source,
        url,
      });
      return;
    }

    if (channel === "whatsapp") {
      fbqTrackCustom("ClickWhatsApp", {
        source,
        url,
      });
    }
  };

  const trackSocialNetworkSelect = (option: {
    value: string;
    label: string;
  }) => {
    const channel = getSocialChannel(option.label, option.value);
    trackContactClick(
      channel,
      normalizeExternalUrl(option.value),
      "lead_form_select",
    );
  };

  const redirectAfterPixel = (url: string) => {
    window.setTimeout(() => {
      window.location.href = url;
    }, 300);
  };

  const notifyError = (message: string) => {
    setError(message);
    if (typeof window !== "undefined") {
      window.alert(message);
    }
  };

  const appendLeadStartCode = (
    url: string,
    channel: string,
    leadStartCode?: string,
  ) => {
    if (!leadStartCode) return url;

    try {
      const nextUrl = new URL(url);
      if (channel === "telegram") {
        nextUrl.searchParams.set("start", leadStartCode);
        return nextUrl.toString();
      }
      if (channel === "facebook") {
        nextUrl.searchParams.set("ref", leadStartCode);
        return nextUrl.toString();
      }
      if (channel === "whatsapp") {
        nextUrl.searchParams.set("text", `start ${leadStartCode}`);
        return nextUrl.toString();
      }
      return nextUrl.toString();
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
    const socialNetworkUrlRaw = String(
      formData.get("socialnetwork") || "",
    ).trim();
    const socialNetworkUrl = normalizeExternalUrl(socialNetworkUrlRaw);
    const selectedNetwork = socialNetworks.find(
      (item) => normalizeExternalUrl(item.url) === socialNetworkUrl,
    );
    const selectedChannel = getSocialChannel(
      selectedNetwork?.name || "",
      selectedNetwork?.url || socialNetworkUrl,
    );

    if (!name) {
      notifyError("Заполните поле: Ваше имя");
      return;
    }

    if (!email) {
      notifyError("Заполните поле: Email");
      return;
    }

    if (!emailRegex.test(email)) {
      notifyError("Введите корректный Email");
      return;
    }

    if (!socialNetworkUrl) {
      notifyError("Заполните поле: Способ связи");
      return;
    }

    if (honeypot) {
      return;
    }

    if (typeof window !== "undefined") {
      setIsSubmitting(true);
      try {
        fbqTrack("Lead", {
          source: "lead_form_submit",
          channel: selectedChannel,
        });

        const response = await fetch("/api/lead-submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            honeypot,
            ...(kidAgeRaw ? { kid_age: Number(kidAgeRaw) } : {}),
            ...(country ? { country } : {}),
          }),
        });
        const result = (await response.json().catch(() => null)) as {
          leadId?: string;
          leadStartCode?: string;
        } | null;
        if (!response.ok || !result?.leadId) {
          throw new Error("lead_submit_failed");
        }

        const botChannel = ["telegram", "facebook", "whatsapp"].includes(
          selectedChannel,
        );
        if (botChannel) {
          redirectAfterPixel(
            appendLeadStartCode(
              socialNetworkUrl,
              selectedChannel,
              result.leadStartCode,
            ),
          );
          return;
        }

        const quizChannel =
          selectedChannel === "email" ||
          selectedChannel === "instagram" ||
          selectedChannel === "vk";
        if (!quizChannel) {
          redirectAfterPixel(socialNetworkUrl);
          return;
        }

        const params = new URLSearchParams({
          channel: selectedChannel,
          target: socialNetworkUrl,
          leadId: result.leadId,
          name,
          email,
        });
        if (kidAgeRaw) params.set("kid_age", kidAgeRaw);
        if (country) params.set("country", country);
        window.location.href = `/quiz?${params.toString()}`;
      } catch {
        notifyError("Не удалось отправить заявку. Попробуйте снова.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Box w="100%" as="form" onSubmit={onSubmit} textTransform="none" noValidate>
      <Text
        color="#f6d894"
        fontSize={{ base: "lg", md: "2xl" }}
        fontWeight="700"
        lineHeight="1.15"
        mb={{ base: "4", md: "3" }}
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
          <InputLeftElement
            h={{ base: "52px", md: "56px" }}
            color={fieldIconColor}
          >
            <RiUser3Line size={fieldIconSize} />
          </InputLeftElement>
          <Input
            type="text"
            name="name"
            borderRadius="lg"
            placeholder="Ваше имя"
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
          leftIcon={
            showSelectIcons ? (
              <RiListSettingsLine color={fieldIconColor} size={fieldIconSize} />
            ) : undefined
          }
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
          leftIcon={
            showSelectIcons ? (
              <RiMapPin2Line color={fieldIconColor} size={fieldIconSize} />
            ) : undefined
          }
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
          onValueChange={trackSocialNetworkSelect}
          autoSelectFirst={false}
          h={{ base: "52px", md: "56px" }}
          fontSize={{ base: "md", md: "2xl" }}
          leftIcon={
            showSelectIcons ? (
              <RiChat1Line color={fieldIconColor} size={fieldIconSize} />
            ) : undefined
          }
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
          <InputLeftElement
            h={{ base: "52px", md: "56px" }}
            color={fieldIconColor}
          >
            <RiMailLine size={fieldIconSize} />
          </InputLeftElement>
          <Input
            type="email"
            name="email"
            borderRadius="lg"
            placeholder="Email"
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
          size="lg"
          borderRadius="lg"
          h={{ base: "44px", md: "56px" }}
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
          <Text
            gridColumn="1 / -1"
            color="red.300"
            fontSize="sm"
            textTransform="none"
          >
            {error}
          </Text>
        ) : null}
      </Grid>
    </Box>
  );

  return <Box w="100%"></Box>;
}
