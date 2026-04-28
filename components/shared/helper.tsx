import React from "react";
import ReactMarkdown, { Components } from "react-markdown";
import Link from "next/link";
import { IPm } from "../../types/selector";
import { capitalize } from "../main/side/selector/section/PmGroup/helper";
import { format } from "../../redux/amountsHelper";
import { IDotColors, IExchangerStatus } from "../../types/exchanger";

/**
 * Markdown renderer with Next.js <Link> for internal navigation
 * and secure <a> for external links.
 */
export const TextToHTML = ({
  text,
  components,
}: {
  text?: string;
  components?: Components;
}) => {
  if (!text?.trim()) return null;

  // Demote Markdown H1 (#) to H2 (##) to avoid top-level headings.
  const normalizedText = text.replace(/^#(?!#)\s+(.*)$/gm, "## $1");

  const baseComponents: Components = {
    a: ({ href, children, ...props }) => {
      if (!href || href.trim().toLowerCase().startsWith("javascript:")) {
        return <>{children}</>;
      }

      const isInternal = href.startsWith("/");

      if (isInternal) {
        return (
          <Link href={href} {...props}>
            <b>{children}</b>
          </Link>
        );
      }

      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          <b>{children}</b>
        </a>
      );
    },
  };

  return (
    <ReactMarkdown components={{ ...baseComponents, ...components }}>
      {normalizedText}
    </ReactMarkdown>
  );
};

/**
 * Enrich text with markdown links to article pages.
 */
export const enrichText = ({
  seen,
  text,
  articleCodes = [],
  pms = [],
}: {
  seen: Set<string>;
  text: string;
  articleCodes: string[];
  pms?: IPm[];
}): string => {
  if (!text || !articleCodes.length || !pms.length) return text;

  const lookup: { key: string; pm: IPm }[] = [];

  articleCodes.forEach((code) => {
    const pm = pms.find(
      (pm) =>
        pm.en_name.toLowerCase().replace(/\s+/g, "-") === code.toLowerCase(),
    );
    if (!pm) return;

    const addVariant = (v?: string | null) => {
      if (!v) return;
      // normalize hyphens → spaces, lowercase
      const normalized = v.replace(/-/g, " ").trim();
      lookup.push({ key: normalized, pm });
    };

    pm.section == "crypto" && addVariant(pm.currency.code);
    addVariant(pm.en_name);
    addVariant(pm.ru_name);
  });

  // Custom "word" matcher that works with Unicode (Cyrillic, etc.)
  return text.replace(
    /(^|[^\p{L}\p{N}_-])([\p{L}\p{N}_-]+)/gu,
    (full, prefix, word) => {
      const match = lookup.find(
        ({ key }) =>
          word.replace(/-/g, " ").toLowerCase() ===
          key.replace(/-/g, " ").toLowerCase(),
      );

      if (!match) return full;

      const slug =
        "/articles/" + match.pm.en_name.toLowerCase().replace(/\s+/g, "-");

      if (seen.has(slug)) return full;
      seen.add(slug);

      return `${prefix}[**${word}**](${slug})`;
    },
  );
};

export function secondsAgo(timestamp?: number | string): string {
  if (!timestamp) return "";
  const ts = typeof timestamp === "string" ? Number(timestamp) : timestamp;
  const now = Date.now();
  const diffSec = Math.floor((now - ts) / 1000);

  if (diffSec < 0) return "в будущем";
  if (diffSec < 60) return `${diffSec}с`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}м`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}ч`;
  return `${Math.floor(diffSec / 86400)}д`;
}

export const waitSec = (seconds: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
};

export const isCashPm = (pm?: IPm | null) =>
  !!pm &&
  ((pm.section && pm.section.toLowerCase() === "cash") ||
    pm.code?.toUpperCase().includes("CASH") ||
    pm.en_name?.toLowerCase().includes("cash"));

export const buildRateString = ({
  course,
  giveCur,
  getCur,
}: {
  course?: number;
  giveCur?: string;
  getCur?: string;
}) => {
  if (!course || !giveCur || !getCur) return "";
  return course < 1
    ? `1 ${giveCur} = ${format(1 / course, 1)} ${getCur}`
    : `${format(course, 1)} ${giveCur} = 1 ${getCur}`;
};

export const getPmNameFromPm = (pm?: IPm | null, isShort: boolean = false) => {
  if (!pm) return "";
  const nameSameAsCurrency =
    pm.code?.toUpperCase() === pm.en_name?.toUpperCase();

  if (isShort) {
    return (
      pm.subgroup_name ||
      (!nameSameAsCurrency ? capitalize(pm.en_name) : "") ||
      ""
    );
  }

  const baseName = capitalize((pm.en_name ?? "").slice(0, 12));
  const cryptoSuffix =
    pm.section === "crypto"
      ? pm.subgroup_name?.toUpperCase() ||
        (!nameSameAsCurrency ? pm.currency?.code?.toUpperCase() : "") ||
        ""
      : "";
  return cryptoSuffix ? `${baseName} ${cryptoSuffix}` : baseName;
};

export const statusToColor = (status?: IExchangerStatus | null): IDotColors =>
  status === "active"
    ? "green"
    : status === "paused" || status === "suspended"
      ? "orange"
      : "red";
