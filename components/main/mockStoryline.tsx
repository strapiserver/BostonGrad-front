import {
  Box,
  Grid,
  HStack,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { RiMapPin2Line } from "react-icons/ri";
import { IStory } from "../../types/pages";

type StorylineProps = {
  stories?: IStory[] | null;
};

const fallbackStories: IStory[] = [
  {
    id: "mock-1",
    name: "Александр",
    age: 16,
    city: "Москва",
    short_description: "Летняя программа в Northeastern + дальнейшая подача в США",
  },
  {
    id: "mock-2",
    name: "Майя",
    age: 15,
    city: "Тбилиси",
    short_description: "2 недели академического английского и профильных воркшопов",
  },
  {
    id: "mock-3",
    name: "Даниэль",
    age: 17,
    city: "Алматы",
    short_description: "Подготовка портфолио и учебный трек по business analytics",
  },
];

const presentName = (story: IStory) => {
  const rawName = String(story.name || "").trim();
  if (!rawName) return "Ученик";
  const age = Number.isFinite(story.age as number) ? story.age : null;
  return age ? `${rawName}, ${age}` : rawName;
};

export default function MockStoryline({ stories }: StorylineProps) {
  const cards = (stories || []).filter((story) => story?.name?.trim()) as IStory[];
  const data = cards.length ? cards : fallbackStories;

  return (
    <VStack align="stretch" spacing={{ base: 4, md: 5 }} px={{ base: 4, md: 8 }} pb={{ base: 8, md: 10 }}>
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={5}>
        {data.map((item) => {
          const href = item.article?.code
            ? `/articles/${String(item.article.code).toLowerCase()}`
            : null;

          return (
          <LinkBox
            key={item.id}
            borderRadius="xl"
            bg="linear-gradient(160deg, rgba(73,23,23,0.94) 0%, rgba(54,17,17,0.96) 100%)"
            border="1px solid rgba(246,216,148,0.22)"
            p={5}
            boxShadow="0 10px 25px rgba(0,0,0,0.22)"
            transition="transform .2s ease, box-shadow .2s ease, border-color .2s ease"
            _hover={
              href
                ? {
                    transform: "translateY(-4px)",
                    boxShadow: "0 16px 34px rgba(0,0,0,0.35)",
                    borderColor: "rgba(246,216,148,0.42)",
                  }
                : undefined
            }
            cursor={href ? "pointer" : "default"}
          >
            <Text color="#f6d894" fontSize="sm" textTransform="uppercase" letterSpacing="0.08em" mb={3}>
              История
            </Text>
            {href ? (
              <LinkOverlay as={NextLink} href={href}>
                <Text color="white" fontSize="2xl" fontWeight="700" mb={1} lineHeight="1.2">
                  {presentName(item)}
                </Text>
              </LinkOverlay>
            ) : (
              <Text color="white" fontSize="2xl" fontWeight="700" mb={1} lineHeight="1.2">
                {presentName(item)}
              </Text>
            )}
            <HStack color="rgba(255,255,255,0.88)" fontSize="md" mb={3} spacing={2}>
              <RiMapPin2Line />
              <Text>{item.city || "Город не указан"}</Text>
            </HStack>
            <Text color="rgba(255,255,255,0.96)" fontSize="xl" lineHeight="1.45">
              {item.short_description || "Описание будет добавлено"}
            </Text>
            {href ? (
              <Text
                mt={4}
                color="#f6d894"
                fontSize="sm"
                fontWeight="700"
                textTransform="uppercase"
                letterSpacing="0.08em"
              >
                Читать историю
              </Text>
            ) : null}
          </LinkBox>
        )})}
      </Grid>
    </VStack>
  );
}
