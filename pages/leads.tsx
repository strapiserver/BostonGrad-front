import { Box, Button, Heading, Input, Spinner, Text, VStack } from "@chakra-ui/react";
import {
  FormEvent,
  ReactNode,
  UIEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Head from "next/head";
import Lead from "../components/lead";
import { CountryOption, LeadEditorState, LeadItem } from "../types/lead";

const ESTIMATED_ROW_HEIGHT = 760;
const VIRTUAL_LIST_GAP = 16;
const VIRTUAL_LIST_HEIGHT = "calc(100vh - 140px)";
const VIRTUAL_LIST_OVERSCAN = 2;

function VirtualLeadRow({
  top,
  onHeightChange,
  children,
}: {
  top: number;
  onHeightChange: (height: number) => void;
  children: ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = rowRef.current;
    if (!element) return;

    const measure = () => {
      onHeightChange(element.getBoundingClientRect().height);
    };

    measure();

    const ResizeObserverCtor =
      typeof window !== "undefined" ? window.ResizeObserver : undefined;
    if (!ResizeObserverCtor) return;

    const observer = new ResizeObserverCtor(() => measure());
    observer.observe(element);

    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <Box
      position="absolute"
      top={`${top}px`}
      left="0"
      right="0"
      ref={rowRef}
    >
      {children}
    </Box>
  );
}

const LeadsNoIndex = () => (
  <Head>
    <meta name="robots" content="noindex,nofollow" />
  </Head>
);

export default function LeadsPage() {
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<LeadItem[] | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [editorStates, setEditorStates] = useState<Record<string, LeadEditorState>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});

  const loadLeads = useCallback(async () => {
    const response = await fetch("/api/leads/list");
    if (response.status === 401) {
      setLeads(null);
      return;
    }
    if (!response.ok) {
      throw new Error("Failed to load leads");
    }
    const payload = await response.json();
    const nextLeads = Array.isArray(payload?.leads) ? payload.leads : [];
    setLeads(nextLeads);
    setEditorStates((prev) => {
      const nextState: Record<string, LeadEditorState> = {};
      for (const lead of nextLeads) {
        if (prev[lead.id]) {
          nextState[lead.id] = prev[lead.id];
        }
      }
      return nextState;
    });
    setRowHeights((prev) => {
      const nextState: Record<string, number> = {};
      for (const lead of nextLeads) {
        if (prev[lead.id]) {
          nextState[lead.id] = prev[lead.id];
        }
      }
      return nextState;
    });
  }, []);

  const loadCountries = useCallback(async () => {
    const response = await fetch("/api/leads/countries");
    if (response.status === 401) {
      setCountries([]);
      return;
    }
    if (!response.ok) {
      throw new Error("Failed to load countries");
    }
    const payload = await response.json();
    setCountries(Array.isArray(payload?.countries) ? payload.countries : []);
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      await Promise.all([loadLeads(), loadCountries()]);
    } catch {
      setError("Не удалось загрузить лиды");
      setLeads(null);
      setCountries([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadCountries, loadLeads]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || isLoginLoading) return;
    setIsLoginLoading(true);
    setError("");
    try {
      const response = await fetch("/api/leads/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setError("Неверный пароль");
        } else {
          const payload = await response.json().catch(() => null);
          setError(payload?.error || "Не удалось войти");
        }
        return;
      }
      setPassword("");
      await loadAll();
    } finally {
      setIsLoginLoading(false);
    }
  };

  const onLogout = async () => {
    await fetch("/api/leads/logout", { method: "POST" });
    setLeads(null);
    setEditorStates({});
    setRowHeights({});
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateViewport = () => {
      setViewportHeight(element.clientHeight);
    };

    updateViewport();

    const ResizeObserverCtor =
      typeof window !== "undefined" ? window.ResizeObserver : undefined;
    if (!ResizeObserverCtor) return;

    const observer = new ResizeObserverCtor(() => updateViewport());
    observer.observe(element);

    return () => observer.disconnect();
  }, [leads]);

  const {
    totalHeight,
    visibleItems,
  } = useMemo(() => {
    if (!leads?.length) {
      return {
        totalHeight: 0,
        visibleItems: [] as Array<{ lead: LeadItem; top: number }>,
      };
    }

    const tops: number[] = new Array(leads.length);
    let offset = 0;

    for (let index = 0; index < leads.length; index += 1) {
      tops[index] = offset;
      const lead = leads[index];
      const height = rowHeights[lead.id] ?? ESTIMATED_ROW_HEIGHT;
      offset += height + VIRTUAL_LIST_GAP;
    }

    const total = Math.max(0, offset - VIRTUAL_LIST_GAP);
    const viewportEnd = scrollTop + viewportHeight;
    let startIndex = 0;

    while (startIndex < leads.length) {
      const lead = leads[startIndex];
      const height = rowHeights[lead.id] ?? ESTIMATED_ROW_HEIGHT;
      if (tops[startIndex] + height >= scrollTop) {
        break;
      }
      startIndex += 1;
    }

    let endIndex = startIndex;
    while (endIndex < leads.length) {
      if (tops[endIndex] > viewportEnd) {
        break;
      }
      endIndex += 1;
    }

    const sliceStart = Math.max(0, startIndex - VIRTUAL_LIST_OVERSCAN);
    const sliceEnd = Math.min(leads.length, endIndex + VIRTUAL_LIST_OVERSCAN);

    return {
      totalHeight: total,
      visibleItems: leads.slice(sliceStart, sliceEnd).map((lead, relativeIndex) => {
        const index = sliceStart + relativeIndex;
        return {
          lead,
          index,
          top: tops[index],
        };
      }),
    };
  }, [leads, rowHeights, scrollTop, viewportHeight]);

  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const onEditorStateChange = useCallback((leadId: string, nextState: LeadEditorState) => {
    setEditorStates((prev) => {
      if (prev[leadId] === nextState) {
        return prev;
      }
      return {
        ...prev,
        [leadId]: nextState,
      };
    });
  }, []);

  const onRowHeightChange = useCallback((leadId: string, height: number) => {
    const normalizedHeight = Math.ceil(height);
    setRowHeights((prev) => {
      if (prev[leadId] === normalizedHeight) {
        return prev;
      }
      return {
        ...prev,
        [leadId]: normalizedHeight,
      };
    });
  }, []);

  if (isLoading) {
    return (
      <>
        <LeadsNoIndex />
        <VStack py="20">
          <Spinner />
        </VStack>
      </>
    );
  }

  if (!leads) {
    return (
      <>
        <LeadsNoIndex />
        <VStack py="20" px="4">
          <Box as="form" onSubmit={onLogin} w="100%" maxW="420px">
            <VStack align="stretch" spacing="4">
              <Heading size="md">Leads Login</Heading>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
              />
              <Button type="submit" isLoading={isLoginLoading}>
                Войти
              </Button>
              {error ? <Text color="red.500">{error}</Text> : null}
            </VStack>
          </Box>
        </VStack>
      </>
    );
  }

  return (
    <>
      <LeadsNoIndex />
      <VStack align="stretch" px="4" py="6" spacing="4">
        <Box display="flex" alignItems="center" justifyContent="space-between" gap="3">
          <Heading size="md">Leads ({leads.length})</Heading>
          <Button variant="outline" onClick={onLogout}>
            Выйти
          </Button>
        </Box>

        {error ? <Text color="red.500">{error}</Text> : null}

        <Box
          ref={scrollRef}
          position="relative"
          overflowY="auto"
          h={VIRTUAL_LIST_HEIGHT}
          pr="2"
          onScroll={onScroll}
        >
          <Box position="relative" minH={`${totalHeight}px`}>
            {visibleItems.map(({ lead, top }) => (
              <VirtualLeadRow
                key={lead.id}
                top={top}
                onHeightChange={(height) => onRowHeightChange(lead.id, height)}
              >
                <Lead
                  lead={lead}
                  countries={countries}
                  editorState={editorStates[lead.id]}
                  onEditorStateChange={(nextState) =>
                    onEditorStateChange(lead.id, nextState)
                  }
                />
              </VirtualLeadRow>
            ))}
          </Box>
        </Box>
      </VStack>
    </>
  );
}
