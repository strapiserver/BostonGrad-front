import {
  Button,
  HStack,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";

type LanguageCode = "pt" | "en" | "ru" | "es" | "zh" | "de" | "fr";

const languages: Array<{
  code: LanguageCode;
  flag: string;
  label: string;
  googleCode: string;
  htmlLang: string;
}> = [
  { code: "pt", flag: "🇵🇹", label: "Português", googleCode: "pt", htmlLang: "pt" },
  { code: "en", flag: "🇺🇸", label: "English", googleCode: "en", htmlLang: "en" },
  { code: "ru", flag: "🇷🇺", label: "Русский", googleCode: "ru", htmlLang: "ru" },
  { code: "es", flag: "🇪🇸", label: "Español", googleCode: "es", htmlLang: "es" },
  { code: "zh", flag: "🇨🇳", label: "中文", googleCode: "zh-CN", htmlLang: "zh-CN" },
  { code: "de", flag: "🇩🇪", label: "Deutsch", googleCode: "de", htmlLang: "de" },
  { code: "fr", flag: "🇫🇷", label: "Français", googleCode: "fr", htmlLang: "fr" },
];

const storageKey = "bostongrad-language";
const callbackName = "bostongradGoogleTranslateInit";

const setTranslationCookie = (googleCode: string | null) => {
  const value = googleCode ? `/ru/${googleCode}` : "";
  const maxAge = googleCode ? 60 * 60 * 24 * 365 : 0;
  const cookie = `googtrans=${value};path=/;max-age=${maxAge};SameSite=Lax`;

  document.cookie = cookie;
  if (window.location.hostname.endsWith("bostongrad.com")) {
    document.cookie = `${cookie};domain=.bostongrad.com`;
  }
};

const Language = () => {
  const [selectedCode, setSelectedCode] = useState<LanguageCode>("ru");
  const menuBg = useColorModeValue("bg.10", "bg.800");
  const hoverBg = useColorModeValue("bg.100", "bg.700");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey) as LanguageCode | null;
    if (saved && languages.some(({ code }) => code === saved)) {
      setSelectedCode(saved);
      const language = languages.find(({ code }) => code === saved);
      if (language) document.documentElement.lang = language.htmlLang;
    }

    const translateWindow = window as any;
    translateWindow[callbackName] = () => {
      if (!translateWindow.google?.translate?.TranslateElement) return;
      new translateWindow.google.translate.TranslateElement(
        {
          pageLanguage: "ru",
          includedLanguages: "de,en,es,fr,pt,ru,zh-CN",
          autoDisplay: false,
        },
        "google_translate_element",
      );
    };

    if (!document.querySelector('script[data-bostongrad-translate="true"]')) {
      const script = document.createElement("script");
      script.src = `https://translate.google.com/translate_a/element.js?cb=${callbackName}`;
      script.async = true;
      script.dataset.bostongradTranslate = "true";
      document.body.appendChild(script);
    }

    return () => {
      delete translateWindow[callbackName];
    };
  }, []);

  const selectLanguage = (code: LanguageCode) => {
    const language = languages.find((item) => item.code === code);
    if (!language) return;

    setSelectedCode(code);
    window.localStorage.setItem(storageKey, code);
    document.documentElement.lang = language.htmlLang;
    setTranslationCookie(code === "ru" ? null : language.googleCode);
    window.location.reload();
  };

  const selected =
    languages.find(({ code }) => code === selectedCode) || languages[2];

  return (
    <>
      <div id="google_translate_element" aria-hidden="true" />
      <div className="notranslate" translate="no">
        <Menu placement="bottom-end" autoSelect={false}>
          <MenuButton
            as={Button}
            variant="contrast"
            h="36px"
            minH="36px"
            px={{ base: 2, sm: 3 }}
            borderRadius="xl"
            rightIcon={<FiChevronDown />}
            aria-label={`Language: ${selected.label}`}
          >
            <HStack spacing="1.5">
              <Text as="span" fontSize="lg" lineHeight="1">
                {selected.flag}
              </Text>
              <Text as="span" fontSize="sm" fontWeight="700" textTransform="lowercase">
                {selected.code}
              </Text>
            </HStack>
          </MenuButton>
          <MenuList
            minW="190px"
            bg={menuBg}
            borderColor="bg.200"
            borderRadius="xl"
            boxShadow="xl"
            py="2"
            zIndex="tooltip"
          >
            {languages.map((language) => (
              <MenuItem
                key={language.code}
                bg="transparent"
                _hover={{ bg: hoverBg }}
                _focus={{ bg: hoverBg }}
                fontWeight={language.code === selectedCode ? "700" : "500"}
                onClick={() => selectLanguage(language.code)}
              >
                <HStack w="100%" spacing="3">
                  <Text as="span" fontSize="xl" lineHeight="1">
                    {language.flag}
                  </Text>
                  <Text as="span" flex="1" color="bg.800">
                    {language.label}
                  </Text>
                  <Text as="span" color="bg.500" fontSize="xs" fontWeight="700">
                    {language.code}
                  </Text>
                </HStack>
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </div>
    </>
  );
};

export default Language;
