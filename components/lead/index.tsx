import {
  Badge,
  Box,
  Card,
  CardBody,
  Divider,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  Switch,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import {
  MdCheckCircle,
  MdCancel,
  MdHelpOutline,
  MdHourglassTop,
  MdNewReleases,
  MdSave,
} from "react-icons/md";
import UserAgent from "../shared/UserAgent";
import {
  CountryOption,
  LeadDraft,
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
}: {
  lead: LeadItem;
  countries: CountryOption[];
}) {
  const [draft, setDraft] = useState<LeadDraft>(() => buildDraft(lead));
  const [baseline, setBaseline] = useState<LeadDraft>(() => buildDraft(lead));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const nextDraft = buildDraft(lead);
    setDraft(nextDraft);
    setBaseline(nextDraft);
    setError("");
    setSavedMessage("");
  }, [lead]);

  const resolvedCountries = useMemo(() => {
    if (!lead.country) return countries;
    if (countries.some((country) => country.id === lead.country?.id)) {
      return countries;
    }
    return [lead.country, ...countries];
  }, [countries, lead.country]);

  const isDirty = !areDraftsEqual(draft, baseline);
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

      setBaseline(draft);
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
              <Text fontSize="lg" fontWeight="700">
                Lead #{lead.id}
              </Text>
              <Badge
                colorScheme={statusMetaEntry.colorScheme}
                display="inline-flex"
                alignItems="center"
                gap="1"
                px="2"
                py="1"
                borderRadius="md"
                textTransform="none"
              >
                <StatusIcon />
                {statusMetaEntry.label}
              </Badge>
              <UserAgent userAgent={lead.userAgent} />
            </HStack>

            <HStack spacing="2">
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

          <Text fontSize="sm" color="gray.500">
            {lead.createdAt ? new Date(lead.createdAt).toLocaleString("ru-RU") : ""}
          </Text>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
            <FormControl>
              <FormLabel mb="1">Name</FormLabel>
              <Input
                value={draft.name}
                onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              />
            </FormControl>

            <FormControl>
              <FormLabel mb="1">Status</FormLabel>
              <Select
                value={draft.status}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    status: e.target.value as LeadStatus,
                  }))
                }
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel mb="1">Age</FormLabel>
              <Input
                type="number"
                value={draft.kid_age}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, kid_age: e.target.value }))
                }
              />
            </FormControl>

            <FormControl>
              <FormLabel mb="1">Country</FormLabel>
              <Select
                value={draft.countryId}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, countryId: e.target.value }))
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

            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel mb="1">User-Agent</FormLabel>
              <HStack spacing="2" align="center">
                <UserAgent userAgent={draft.userAgent} />
                <Input
                  value={draft.userAgent}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, userAgent: e.target.value }))
                  }
                />
              </HStack>
            </FormControl>

            <FormControl gridColumn={{ base: "auto", md: "1 / -1" }}>
              <FormLabel mb="1">Admin comment</FormLabel>
              <Textarea
                value={draft.admin_comment}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, admin_comment: e.target.value }))
                }
                minH="110px"
              />
            </FormControl>
          </SimpleGrid>

          {lead.lead_contacts.length ? (
            <Box>
              <Text fontSize="sm" fontWeight="600" mb="2">
                Lead contacts
              </Text>
              <Stack spacing="2">
                {lead.lead_contacts.map((contact) => (
                  <Box key={contact.id} p="3" borderWidth="1px" borderRadius="md">
                    <Text fontSize="sm" fontWeight="600">
                      {contact.socialnetworkName || "Contact"} {contact.username ? `@${contact.username}` : ""}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      user_id: {contact.user_id}
                      {contact.isBanned ? " | banned" : ""}
                      {contact.isCallForbidden ? " | call forbidden" : ""}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Box>
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
