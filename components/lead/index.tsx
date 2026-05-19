import {
  Badge,
  Button,
  Card,
  CardBody,
  Divider,
  Editable,
  EditableInput,
  EditablePreview,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  Switch,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MdCheckCircle,
  MdCancel,
  MdHelpOutline,
  MdHourglassTop,
  MdNewReleases,
  MdOpenInNew,
  MdSave,
} from "react-icons/md";
import UserAgent from "../shared/UserAgent";
import {
  CountryOption,
  LeadDraft,
  LeadEditorState,
  LeadItem,
  LeadStatus,
} from "../../types/lead";

const statusMeta: Record<
  string,
  {
    label: string;
    colorScheme: string;
    icon: any;
  }
> = {
  not_verified: {
    label: "Not verified",
    colorScheme: "gray",
    icon: MdHelpOutline,
  },
  new: {
    label: "New",
    colorScheme: "blue",
    icon: MdNewReleases,
  },
  awaiting_call: {
    label: "Awaiting call",
    colorScheme: "orange",
    icon: MdHourglassTop,
  },
  interested: {
    label: "Interested",
    colorScheme: "teal",
    icon: MdHourglassTop,
  },
  ready: {
    label: "Ready",
    colorScheme: "cyan",
    icon: MdHourglassTop,
  },
  paid: {
    label: "Paid",
    colorScheme: "green",
    icon: MdCheckCircle,
  },
  visa_done: {
    label: "Visa done",
    colorScheme: "green",
    icon: MdCheckCircle,
  },
  finished: {
    label: "Finished",
    colorScheme: "green",
    icon: MdCheckCircle,
  },
  canceled: {
    label: "Canceled",
    colorScheme: "red",
    icon: MdCancel,
  },
};

const statusOptions = Object.entries(statusMeta).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

const boolFromAnswer = (answer: string) => {
  const normalized = String(answer || "")
    .trim()
    .toLowerCase();
  return ["true", "1", "yes", "да"].includes(normalized);
};

const normalizeHandle = (value: string) => String(value || "").trim().replace(/^@+/, "");
const isExternalUrl = (value: string) => /^https?:\/\//i.test(String(value || "").trim());
const looksNumeric = (value: string) => /^\d+$/.test(String(value || "").trim());

type ContactLinkInfo = {
  id: string;
  networkLabel: string;
  valueLabel: string;
  href: string;
  actionLabel: string;
  isExternal: boolean;
};

const buildContactLink = (contact: LeadItem["lead_contacts"][number]): ContactLinkInfo | null => {
  const networkLabel = String(contact.socialnetworkName || "").trim() || "Contact";
  const network = networkLabel.toLowerCase();
  const username = normalizeHandle(contact.username);
  const userId = String(contact.user_id || "").trim();
  const rawValue = username || userId;
  if (!rawValue) return null;

  if (isExternalUrl(contact.username)) {
    return {
      id: contact.id,
      networkLabel,
      valueLabel: String(contact.username).trim(),
      href: String(contact.username).trim(),
      actionLabel: "Open",
      isExternal: true,
    };
  }

  if (isExternalUrl(contact.user_id)) {
    return {
      id: contact.id,
      networkLabel,
      valueLabel: String(contact.user_id).trim(),
      href: String(contact.user_id).trim(),
      actionLabel: "Open",
      isExternal: true,
    };
  }

  if (network.includes("telegram")) {
    const slug = username || normalizeHandle(userId);
    if (slug && !looksNumeric(slug)) {
      return {
        id: contact.id,
        networkLabel,
        valueLabel: `@${slug}`,
        href: `https://t.me/${slug}`,
        actionLabel: "Open",
        isExternal: true,
      };
    }
  }

  if (network.includes("facebook")) {
    const slug = username || normalizeHandle(userId);
    if (slug && !looksNumeric(slug)) {
      return {
        id: contact.id,
        networkLabel,
        valueLabel: slug,
        href: `https://facebook.com/${slug}`,
        actionLabel: "Open",
        isExternal: true,
      };
    }
  }

  if (network.includes("instagram")) {
    const slug = username || normalizeHandle(userId);
    if (slug && !looksNumeric(slug)) {
      return {
        id: contact.id,
        networkLabel,
        valueLabel: `@${slug}`,
        href: `https://instagram.com/${slug}`,
        actionLabel: "Open",
        isExternal: true,
      };
    }
  }

  if (network.includes("email")) {
    return {
      id: contact.id,
      networkLabel,
      valueLabel: rawValue,
      href: `mailto:${rawValue}`,
      actionLabel: "Email",
      isExternal: false,
    };
  }

  if (network.includes("whatsapp") || network === "wa") {
    const phone = rawValue.replace(/[^\d+]/g, "");
    if (phone) {
      return {
        id: contact.id,
        networkLabel,
        valueLabel: rawValue,
        href: `https://wa.me/${phone.replace(/^\+/, "")}`,
        actionLabel: "Open",
        isExternal: true,
      };
    }
  }

  return {
    id: contact.id,
    networkLabel,
    valueLabel: rawValue,
    href: "",
    actionLabel: "",
    isExternal: false,
  };
};

const buildContactLinks = (lead: LeadItem) =>
  lead.lead_contacts
    .map((contact) => buildContactLink(contact))
    .filter((contact): contact is ContactLinkInfo => Boolean(contact));

const buildDraft = (lead: LeadItem): LeadDraft => ({
  name: lead.name || "",
  status: lead.status || "new",
  kid_age: lead.kid_age === null || lead.kid_age === undefined ? "" : String(lead.kid_age),
  countryId: lead.country?.id || "",
  userAgent: lead.userAgent || "",
  admin_comment: lead.admin_comment || "",
});

const areDraftsEqual = (a: LeadDraft, b: LeadDraft) =>
  a.name === b.name &&
  a.status === b.status &&
  a.kid_age === b.kid_age &&
  a.countryId === b.countryId &&
  a.userAgent === b.userAgent &&
  a.admin_comment === b.admin_comment;

export default function Lead({
  lead,
  countries,
  editorState,
  onEditorStateChange,
}: {
  lead: LeadItem;
  countries: CountryOption[];
  editorState?: LeadEditorState;
  onEditorStateChange?: (nextState: LeadEditorState) => void;
}) {
  const initialState = useMemo<LeadEditorState>(
    () => ({
      draft: buildDraft(lead),
      baseline: buildDraft(lead),
    }),
    [lead]
  );
  const [localEditorState, setLocalEditorState] = useState<LeadEditorState>(initialState);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  const currentEditorState = editorState || localEditorState;
  const draft = currentEditorState.draft;
  const baseline = currentEditorState.baseline;

  const updateEditorState = useCallback(
    (nextState: LeadEditorState) => {
      if (onEditorStateChange) {
        onEditorStateChange(nextState);
        return;
      }
      setLocalEditorState(nextState);
    },
    [onEditorStateChange]
  );

  const updateDraft = useCallback(
    (updater: (prev: LeadDraft) => LeadDraft) => {
      updateEditorState({
        ...currentEditorState,
        draft: updater(currentEditorState.draft),
      });
    },
    [currentEditorState, updateEditorState]
  );

  useEffect(() => {
    if (!onEditorStateChange) {
      updateEditorState(initialState);
    }
    setError("");
    setSavedMessage("");
  }, [initialState, onEditorStateChange, updateEditorState]);

  const resolvedCountries = useMemo(() => {
    if (!lead.country) return countries;
    if (countries.some((country) => country.id === lead.country?.id)) {
      return countries;
    }
    return [lead.country, ...countries];
  }, [countries, lead.country]);

  const isDirty = !areDraftsEqual(draft, baseline);
  const contactLinks = useMemo(() => buildContactLinks(lead), [lead]);
  const primaryContactLink = contactLinks.find((contact) => contact.href) || null;
  const statusMetaEntry = statusMeta[draft.status] || {
    label: draft.status || "Unknown",
    colorScheme: "gray",
    icon: MdHelpOutline,
  };
  const StatusIcon = statusMetaEntry.icon;

  const onSave = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await fetch("/api/leads/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: lead.id,
          ...draft,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error || "save_failed");
      }

      updateEditorState({
        draft,
        baseline: draft,
      });
      setSavedMessage("Saved");
      window.setTimeout(() => setSavedMessage(""), 1500);
    } catch {
      setError("Не удалось сохранить лид");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardBody>
        <VStack align="stretch" spacing="4">
          <HStack justify="space-between" flexWrap="wrap" align="start">
            <HStack spacing="3" align="center" flexWrap="wrap">
              <HStack spacing="2" align="center">
                <Editable
                  value={draft.name}
                  onChange={(nextValue) =>
                    updateDraft((prev) => ({ ...prev, name: nextValue }))
                  }
                  submitOnBlur
                >
                  <HStack spacing="2">
                    <Text fontSize="lg" fontWeight="700" color="gray.500">
                      Lead #{lead.id}
                    </Text>
                    <EditablePreview
                      fontSize="lg"
                      fontWeight="700"
                      px="2"
                      py="1"
                      borderRadius="md"
                      _hover={{ bg: "gray.50" }}
                    />
                    <EditableInput
                      fontSize="lg"
                      fontWeight="700"
                      px="2"
                      py="1"
                      minW="220px"
                    />
                  </HStack>
                </Editable>
                {primaryContactLink?.href ? (
                  <Tooltip label="Open contact" hasArrow>
                    <Link
                      href={primaryContactLink.href}
                      isExternal={primaryContactLink.isExternal}
                      display="inline-flex"
                    >
                      <IconButton
                        aria-label="Open lead contact"
                        title="Open contact"
                        icon={<MdOpenInNew />}
                        size="sm"
                        variant="ghost"
                      />
                    </Link>
                  </Tooltip>
                ) : null}
              </HStack>
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="ghost"
                  px="0"
                  minW="auto"
                  h="auto"
                  _hover={{ bg: "transparent" }}
                  _active={{ bg: "transparent" }}
                >
                  <Badge
                    colorScheme={statusMetaEntry.colorScheme}
                    display="inline-flex"
                    alignItems="center"
                    gap="1"
                    px="2"
                    py="1"
                    borderRadius="md"
                    textTransform="none"
                    cursor="pointer"
                  >
                    <StatusIcon />
                    {statusMetaEntry.label}
                  </Badge>
                </MenuButton>
                <MenuList>
                  {statusOptions.map((option) => (
                    <MenuItem
                      key={option.value}
                      onClick={() =>
                        updateDraft((prev) => ({
                          ...prev,
                          status: option.value as LeadStatus,
                        }))
                      }
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
              <UserAgent userAgent={lead.userAgent} />
            </HStack>

            <HStack spacing="2">
              <Text fontSize="sm" color="gray.500">
                {lead.createdAt ? new Date(lead.createdAt).toLocaleString("ru-RU") : ""}
              </Text>
              {savedMessage ? (
                <Text fontSize="sm" color="green.500">
                  {savedMessage}
                </Text>
              ) : null}
              {error ? (
                <Text fontSize="sm" color="red.500">
                  {error}
                </Text>
              ) : null}
              <IconButton
                aria-label="Save lead"
                title="Save"
                icon={<MdSave />}
                colorScheme={isDirty ? "blue" : "gray"}
                variant={isDirty ? "solid" : "ghost"}
                isLoading={isSaving}
                isDisabled={!isDirty || isSaving}
                onClick={onSave}
              />
            </HStack>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="4">
            <FormControl gridColumn={{ base: "auto", lg: "1 / 2" }}>
              <FormLabel mb="1">Age</FormLabel>
              <Input
                type="number"
                value={draft.kid_age}
                onChange={(e) =>
                  updateDraft((prev) => ({ ...prev, kid_age: e.target.value }))
                }
              />
            </FormControl>

            <FormControl gridColumn={{ base: "auto", lg: "2 / 3" }}>
              <FormLabel mb="1">Country</FormLabel>
              <Select
                value={draft.countryId}
                onChange={(e) =>
                  updateDraft((prev) => ({ ...prev, countryId: e.target.value }))
                }
              >
                <option value="">—</option>
                {resolvedCountries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl gridColumn={{ base: "auto", lg: "3 / 4" }}>
              <FormLabel mb="1">Admin comment</FormLabel>
              <Input
                value={draft.admin_comment}
                onChange={(e) =>
                  updateDraft((prev) => ({
                    ...prev,
                    admin_comment: e.target.value,
                  }))
                }
              />
            </FormControl>
          </SimpleGrid>

          {contactLinks.length ? (
            <>
              <Divider />
              <VStack align="stretch" spacing="2">
                <Text fontSize="sm" fontWeight="700" color="gray.600">
                  Contacts
                </Text>
                <Stack spacing="2">
                  {contactLinks.map((contact) => (
                    <HStack
                      key={contact.id}
                      justify="space-between"
                      align={{ base: "start", md: "center" }}
                      flexDirection={{ base: "column", md: "row" }}
                      spacing={{ base: "1", md: "3" }}
                      borderWidth="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      px="3"
                      py="2"
                    >
                      <HStack spacing="2" flexWrap="wrap">
                        <Badge colorScheme="purple" textTransform="none">
                          {contact.networkLabel}
                        </Badge>
                        <Text fontSize="sm" color="gray.800" wordBreak="break-word">
                          {contact.valueLabel}
                        </Text>
                      </HStack>
                      {contact.href ? (
                        <Link
                          href={contact.href}
                          isExternal={contact.isExternal}
                          fontSize="sm"
                          fontWeight="600"
                          color="blue.500"
                        >
                          {contact.actionLabel}
                        </Link>
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          No link
                        </Text>
                      )}
                    </HStack>
                  ))}
                </Stack>
              </VStack>
            </>
          ) : null}

          <Divider />

          <Stack spacing="3">
            {lead.responses.map((response) => {
              const q = response.question;
              if (!q) {
                return (
                  <Text key={response.id} fontSize="sm">
                    {response.answer}
                  </Text>
                );
              }

              const label = `${q.text || q.name}${q.isOptional ? "" : " *"}`;
              const hasOptions =
                Array.isArray(q.options) && q.options.length > 0;

              if (hasOptions) {
                return (
                  <FormControl key={response.id}>
                    <FormLabel mb="1">{label}</FormLabel>
                    <Select value={response.answer || ""} isDisabled>
                      <option value="">Не выбрано</option>
                      {q.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                );
              }

              if (q.isBoolean) {
                return (
                  <FormControl
                    key={response.id}
                    display="flex"
                    alignItems="center"
                  >
                    <FormLabel mb="0">{label}</FormLabel>
                    <Switch isChecked={boolFromAnswer(response.answer)} isDisabled />
                  </FormControl>
                );
              }

              return (
                <FormControl key={response.id}>
                  <FormLabel mb="1">{label}</FormLabel>
                  <Input value={response.answer || ""} isReadOnly />
                </FormControl>
              );
            })}
          </Stack>
        </VStack>
      </CardBody>
    </Card>
  );
}
