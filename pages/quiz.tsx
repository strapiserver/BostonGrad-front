import {
  Box,
  Button,
  Grid,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from "@chakra-ui/react";
import type { GetStaticProps } from "next";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import { RiCheckLine, RiMailLine, RiSendPlaneFill } from "react-icons/ri";
import CustomSelect from "../components/shared/CustomSelect";
import {
  cmsLinkDEV,
  cmsLinkPROD,
  internalCmsLink,
  resolveCmsUrl,
} from "../services/utils";
import gridPattern from "../public/grid.png";

type CountryOption = {
  id: string;
  name: string;
};

const loadCountries = async (): Promise<CountryOption[]> => {
  const env = process.env.NODE_ENV;
  const publicBase = env === "production" ? cmsLinkPROD : cmsLinkDEV;
  const cmsBase = resolveCmsUrl(publicBase, internalCmsLink);
  const adminUrl = `${cmsBase}/admin/content-manager/collectionType/api::country.country?page=1&pageSize=200&sort=name:ASC`;
  const apiUrl = `${cmsBase}/api/countries?pagination[page]=1&pagination[pageSize]=200&sort=name:ASC`;

  const extractCountries = (payload: any): CountryOption[] => {
    const candidates = [
      ...(Array.isArray(payload?.results) ? payload.results : []),
      ...(Array.isArray(payload?.data) ? payload.data : []),
    ];
    return candidates
      .map((item: any) => {
        const id = item?.id || item?.documentId || item?.attributes?.id;
        const name = item?.name || item?.attributes?.name;
        if (!id || typeof name !== "string" || !name.trim()) return null;
        return { id: String(id), name };
      })
      .filter((country: any): country is CountryOption => Boolean(country));
  };

  try {
    const adminRes = await fetch(adminUrl);
    if (adminRes.ok) {
      const json = await adminRes.json();
      const countries = extractCountries(json);
      if (countries.length) return countries;
    }
  } catch {}

  try {
    const apiRes = await fetch(apiUrl);
    if (!apiRes.ok) return [];
    const apiJson = await apiRes.json();
    return extractCountries(apiJson);
  } catch {
    return [];
  }
};

type Props = {
  countries: CountryOption[];
};

const contactLabelByChannel = (channel: string) => {
  const c = channel.toLowerCase();
  if (c === "email") return "Ваш Email";
  if (c === "instagram") return "Ваш Instagram (@username)";
  if (c === "vk") return "Ваш VK (ссылка или id)";
  return "Контакт";
};

export default function QuizPage({ countries }: Props) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const channel = String(router.query.channel || "email").toLowerCase();
  const target = String(router.query.target || "");
  const name = String(router.query.name || "").trim();
  const email = String(router.query.email || "").trim();
  const kidAgeRaw = String(router.query.kid_age || "").trim();
  const country = String(router.query.country || "").trim();

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting || isSent) return;
    setError("");

    const formData = new FormData(e.currentTarget);
    const together = String(formData.get("together") || "").trim();
    const education = String(formData.get("education") || "").trim();
    const contactValue = String(formData.get("contact") || "").trim();

    if (
      !name ||
      !kidAgeRaw ||
      !country ||
      !together ||
      !education ||
      !contactValue
    ) {
      setError("Заполните все поля опроса");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/lead-quiz-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          kid_age: Number(kidAgeRaw),
          country,
          together,
          education,
          contactChannel: channel,
          contactValue,
          emailContact: email,
        }),
      });
      if (!response.ok) throw new Error("submit_failed");
      setIsSent(true);

      if (channel !== "email" && target) {
        setTimeout(() => {
          window.location.href = target;
        }, 850);
      }
    } catch {
      setError("Не удалось отправить анкету. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      position="relative"
      minH="calc(100vh - 56px)"
      w="100vw"
      ml="calc(50% - 50vw)"
      bg="#290f0f"
      color="white"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset="0"
        w="100%"
        h="100%"
        filter={{ base: "opacity(0.5)", lg: "opacity(0.3)" }}
        zIndex={0}
        pointerEvents="none"
      >
        <Box
          as="img"
          src={gridPattern.src}
          alt="Grid background pattern"
          w="100%"
          h="100%"
          objectFit="cover"
        />
      </Box>

      <Box
        position="relative"
        zIndex={1}
        maxW="900px"
        mx="auto"
        px={{ base: 5, md: 8 }}
        py={{ base: 8, md: 12 }}
      >
        <Box
          bg="linear-gradient(165deg, #5b1f1f 0%, #431616 100%)"
          border="1px solid rgba(255,255,255,0.15)"
          borderRadius="2xl"
          p={{ base: 5, md: 8 }}
          boxShadow="0 18px 50px rgba(0,0,0,0.35)"
        >
          <Text
            color="#f6d894"
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="800"
            textTransform="uppercase"
            lineHeight="1.15"
            mb="2"
          >
            Анкета
          </Text>
          <Text
            color="rgba(255,255,255,0.9)"
            fontSize={{ base: "lg", md: "xl" }}
            mb="6"
          >
            Заполните опрос, и мы свяжемся с вами в выбранном канале.
          </Text>
          <Box as="form" onSubmit={onSubmit}>
            <Grid gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4}>
              <CustomSelect
                name="together"
                placeholder="Планируете ехать с ребенком?"
                autoSelectFirst={false}
                h={{ base: "58px", md: "52px" }}
                fontSize={{ base: "lg", md: "md" }}
                options={[
                  { value: "yes", label: "Да" },
                  { value: "no", label: "Нет" },
                ]}
                bg="white"
                color="#2d1a1a"
                borderColor="rgba(255,255,255,0.65)"
              />

              <CustomSelect
                name="education"
                placeholder="Цель программы"
                autoSelectFirst={false}
                h={{ base: "58px", md: "52px" }}
                fontSize={{ base: "lg", md: "md" }}
                options={[
                  { value: "school", label: "Школа / лагерь" },
                  { value: "college", label: "Колледж" },
                  { value: "university", label: "Университет" },
                ]}
                bg="white"
                color="#2d1a1a"
                borderColor="rgba(255,255,255,0.65)"
              />

              <InputGroup>
                <InputLeftElement
                  h={{ base: "58px", md: "52px" }}
                  color="#5a2a2a"
                >
                  <RiMailLine />
                </InputLeftElement>
                <Input
                  name="contact"
                  placeholder={contactLabelByChannel(channel)}
                  defaultValue={channel === "email" ? email : ""}
                  required
                  h={{ base: "58px", md: "52px" }}
                  pl="10"
                  fontSize={{ base: "lg", md: "md" }}
                  bg="white"
                  color="#2d1a1a"
                  borderColor="rgba(255,255,255,0.65)"
                  _hover={{ borderColor: "rgba(255,255,255,0.9)" }}
                  _focus={{
                    borderColor: "#f6d894",
                    boxShadow: "0 0 0 1px rgba(246,216,148,0.9)",
                  }}
                />
              </InputGroup>

              <Button
                mt={1}
                size="lg"
                w="100%"
                gridColumn={{ base: "1 / -1", md: "auto" }}
                type="submit"
                isLoading={isSubmitting}
                fontSize={{ base: "lg", md: "xl" }}
                bg={isSent ? "#2f9e44" : undefined}
                bgGradient={
                  isSent ? undefined : "linear(to-r, #f6d894 0%, #eebc57 100%)"
                }
                color={isSent ? "white" : "#4a1c1c"}
                _hover={{ filter: "brightness(1.03)" }}
                _active={{ filter: "brightness(0.98)" }}
                rightIcon={isSent ? <RiCheckLine /> : <RiSendPlaneFill />}
              >
                {isSent ? "Отправлено" : "Отправить"}
              </Button>

              {error ? (
                <Text
                  gridColumn="1 / -1"
                  color="red.300"
                  fontSize={{ base: "md", md: "lg" }}
                >
                  {error}
                </Text>
              ) : null}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const countries = await loadCountries();
    return {
      props: {
        countries,
      },
      revalidate: 300,
    };
  } catch {
    return {
      props: { countries: [] },
      revalidate: 300,
    };
  }
};
