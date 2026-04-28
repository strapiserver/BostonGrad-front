import React from "react";
import { HStack } from "@chakra-ui/react";
import { ResponsiveText } from "../../../styles/theme/custom";
import { IArticle } from "../../../types/pages";

const formatDate = (ts?: string) => {
  if (!ts) return "";
  const [y, m, d] = ts.split("T")[0].split("-");
  return `${d}.${m}.${y}`;
};

export default function ArticleStats({ article }: { article?: IArticle | null }) {
  if (!article) return null;

  const textLength = article.text?.length || 0;
  const minToRead =
    article.time_to_read ?? (textLength ? Math.max(1, Math.round(textLength / 1000)) : 0);

  if (!article.updatedAt && !minToRead) return null;

  return (
    <HStack spacing="2">
      {article.updatedAt ? (
        <ResponsiveText size="sm" variant="primary" color="white">
          {formatDate(article.updatedAt)}
        </ResponsiveText>
      ) : null}
      {article.updatedAt && minToRead ? (
        <ResponsiveText size="sm" variant="primary" color="white">
          •
        </ResponsiveText>
      ) : null}
      {minToRead ? (
        <ResponsiveText size="sm" variant="primary" color="white">
          {`${minToRead} мин чтения`}
        </ResponsiveText>
      ) : null}
    </HStack>
  );
}
