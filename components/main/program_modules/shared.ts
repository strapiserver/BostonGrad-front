import { keyframes } from "@emotion/react";
import { IconType } from "react-icons";
import {
  RiAwardLine,
  RiBookOpenLine,
  RiBriefcase4Line,
  RiCalendarScheduleLine,
  RiCompass3Line,
  RiFileTextLine,
  RiFlag2Line,
  RiGlobalLine,
  RiGraduationCapLine,
  RiGroupLine,
  RiMapPin2Line,
  RiPoliceBadgeLine,
  RiSafe2Line,
  RiShieldCheckLine,
  RiTeamLine,
  RiUserStarLine,
} from "react-icons/ri";

export const palette = {
  wine900: "#4f1012",
  wine700: "#7e1f24",
  wine600: "#982a2f",
  wine500: "#b53a3f",
  gold500: "#d4ad63",
  gold400: "#ebcd8f",
  paper: "#f8f3eb",
  ink: "#3a2525",
};

export const riseIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(235, 205, 143, 0.0);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(235, 205, 143, 0.15);
  }
`;

export const sectionShell = {
  bg: `linear-gradient(160deg, rgba(248,243,235,0.98) 0%, rgba(244,236,225,0.98) 100%)`,
  border: `1px solid rgba(181,58,63,0.35)`,
  borderRadius: "20px",
  boxShadow: "0 10px 24px rgba(79,16,18,0.12)",
  position: "relative" as const,
  overflow: "hidden" as const,
};

export const sectionTitleCommon = {
  color: palette.wine700,
  fontSize: { base: "xl", md: "2xl" },
  fontWeight: 800,
  lineHeight: 1.15,
  letterSpacing: "-0.005em",
  mb: "4",
};

const normalizeIconKey = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

export const pickStepIcon = (icon?: string, text?: string): IconType => {
  const key = normalizeIconKey(icon);
  const hint = normalizeIconKey(text);
  if (["essay", "эссе", "memo"].includes(key) || hint.includes("эссе"))
    return RiFileTextLine;
  if (
    ["strategy", "стратегия", "calendar", "plan"].includes(key) ||
    hint.includes("стратег")
  )
    return RiCalendarScheduleLine;
  if (
    ["interview", "собеседование", "graduation"].includes(key) ||
    hint.includes("собесед")
  )
    return RiGraduationCapLine;
  if (["resume", "cv", "file"].includes(key) || hint.includes("резюме"))
    return RiBookOpenLine;
  if (
    ["tour", "экскурсия", "university"].includes(key) ||
    hint.includes("экскурс")
  )
    return RiMapPin2Line;
  if (["network", "нетворкинг", "team"].includes(key) || hint.includes("нетворк"))
    return RiTeamLine;
  if (["trip", "new_york", "travel"].includes(key) || hint.includes("нью"))
    return RiGlobalLine;
  return RiCompass3Line;
};

export const pickReasonIcon = (icon?: string, title?: string): IconType => {
  const key = normalizeIconKey(icon);
  const hint = normalizeIconKey(title);
  if (
    ["strategy", "стратегия", "plan", "calendar"].includes(key) ||
    hint.includes("стратег")
  )
    return RiCalendarScheduleLine;
  if (
    ["security", "безопасность", "shield", "safe"].includes(key) ||
    hint.includes("безопас")
  )
    return RiShieldCheckLine;
  if (
    ["city", "boston", "бостон", "campus"].includes(key) ||
    hint.includes("бостон")
  )
    return RiMapPin2Line;
  if (
    ["target", "next_steps", "следующие_шаги"].includes(key) ||
    hint.includes("следующ")
  )
    return RiFlag2Line;
  if (["goal", "понимание_цели", "city"].includes(key) || hint.includes("цел"))
    return RiFlag2Line;
  if (
    ["portfolio", "сильное_портфолио", "cap"].includes(key) ||
    hint.includes("портфол")
  )
    return RiAwardLine;
  if (
    ["contacts", "контакты_и_опыт", "handshake"].includes(key) ||
    hint.includes("контакт")
  )
    return RiGroupLine;
  return RiUserStarLine;
};

export const pickGuaranteeIcon = (icon?: string, text?: string): IconType => {
  const key = normalizeIconKey(icon);
  const hint = normalizeIconKey(text);
  if (
    ["security", "безопасность", "shield"].includes(key) ||
    hint.includes("безопас")
  )
    return RiShieldCheckLine;
  if (
    ["teachers", "топ-преподаватели", "mentor"].includes(key) ||
    hint.includes("преподав")
  )
    return RiBriefcase4Line;
  if (["result", "контроль_результата", "target"].includes(key) || hint.includes("результ"))
    return RiPoliceBadgeLine;
  return RiSafe2Line;
};
