import { Button, HStack, Menu, MenuButton, MenuItem, MenuList, Text, useColorModeValue } from "@chakra-ui/react";
import { FiChevronDown } from "react-icons/fi";
import { languageCodes, localeBundles, useI18n } from "../../../services/i18n";

const languages = languageCodes.map((code) => localeBundles[code]);

const Language = () => {
  const { locale, setLocale } = useI18n();
  const menuBg = useColorModeValue("bg.10", "bg.800");
  const hoverBg = useColorModeValue("bg.100", "bg.700");
  const selected = localeBundles[locale];

  return (
    <Menu placement="bottom-end" autoSelect={false}>
      <MenuButton as={Button} variant="contrast" h="36px" minH="36px" px={{ base: 2, sm: 3 }} borderRadius="xl" rightIcon={<FiChevronDown />} aria-label={`Language: ${selected.label}`}>
        <HStack spacing="1.5">
          <Text as="span" fontSize="lg" lineHeight="1">{selected.flag}</Text>
          <Text as="span" fontSize="sm" fontWeight="700" textTransform="lowercase">{selected.code}</Text>
        </HStack>
      </MenuButton>
      <MenuList minW="190px" bg={menuBg} borderColor="bg.200" borderRadius="xl" boxShadow="xl" py="2" zIndex="tooltip">
        {languages.map((language) => (
          <MenuItem key={language.code} bg="transparent" _hover={{ bg: hoverBg }} _focus={{ bg: hoverBg }} fontWeight={language.code === locale ? "700" : "500"} onClick={() => setLocale(language.code)}>
            <HStack w="100%" spacing="3">
              <Text as="span" fontSize="xl" lineHeight="1">{language.flag}</Text>
              <Text as="span" flex="1" color="bg.800">{language.label}</Text>
              <Text as="span" color="bg.500" fontSize="xs" fontWeight="700">{language.code}</Text>
            </HStack>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default Language;
