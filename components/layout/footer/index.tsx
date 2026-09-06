import { Box, Divider, Flex, Grid } from "@chakra-ui/react";
import WebsiteData from "./WebsiteData";
import FooterLinks from "./FooterLinks";
import { useI18n } from "../../../services/i18n";

const Footer = () => {
  const { t } = useI18n();
  const localizeLinks = (links: typeof aboutLinks) => links.map((link) => ({ ...link, label: t(link.label) }));
  return (
    <Box id="site-end" w="100%" px={{ base: "2", lg: "12%" }}>
      <Flex flexDir="column" justifyContent="space-between" alignItems="center">
        <Grid
          gridTemplateColumns="1fr 1fr 1fr"
          w={{ base: "100%", lg: "70%" }}
          maxW="960px"
          px={{ base: "4", md: "0" }}
          rowGap="8"
          columnGap={{ base: "8", md: "4" }}
          templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
          justifyContent="center"
        >
          <FooterLinks links={localizeLinks(aboutLinks)} title={"BostonGrad"} />
          <FooterLinks links={localizeLinks(programLinks)} title={t("Программа")} />
          <FooterLinks links={localizeLinks(navigationLinks)} title={t("Навигация")} />
        </Grid>
        <Divider mt="8" />
        <WebsiteData />
      </Flex>
    </Box>
  );
};

export default Footer;

const aboutLinks = [
  { label: "Главная", href: "/" },
  { label: "Университеты", href: "/#universities" },
  { label: "Истории участников", href: "/#stories" },
];

const programLinks = [
  { label: "Услуги", href: "/#programs" },
  { label: "Как проходит обучение", href: "/#program-modules" },
  { label: "Консультация", href: "/#lead-form" },
];

const navigationLinks = [
  { label: "Проживание", href: "/articles/living" },
  { label: "Оставить заявку", href: "/#lead-form" },
  { label: "Летняя школа", href: "/articles/summer-school" },
];
