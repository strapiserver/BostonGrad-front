import type { NextApiRequest, NextApiResponse } from "next";
import { redisGet } from "../../cache/redisClient";

type SearchIndexEntry = {
  slug: string;
  header: string;
  wordsToSearchFrom: string;
};

type SearchIndexCache = {
  data: SearchIndexEntry[];
  updatedAt: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") return res.status(405).end();

  const cached =
    ((await redisGet("search:index")) as SearchIndexCache | null) || {
      data: [],
      updatedAt: null,
    };

  try {
    const cachedData = Array.isArray(cached.data) ? cached.data : [];
    const fallbackData: SearchIndexEntry[] = [
      { slug: "", header: "Главная", wordsToSearchFrom: "главная home" },
      {
        slug: "universities",
        header: "Университеты",
        wordsToSearchFrom: "университеты universities programs",
      },
      {
        slug: "living",
        header: "Проживание",
        wordsToSearchFrom: "проживание living housing",
      },
      {
        slug: "contacts",
        header: "Контакты",
        wordsToSearchFrom: "контакты contacts",
      },
    ];

    const combinedData: SearchIndexEntry[] =
      cachedData.length > 0 ? cachedData : fallbackData;

    return res.status(200).json({
      data: combinedData,
      updatedAt: cached.updatedAt ?? null,
    });
  } catch (error) {
    console.error("[search-index] Failed to load search index:", error);
    return res.status(200).json(cached);
  }
}
