import { Box, Button, Heading, Input, Spinner, Text, VStack } from "@chakra-ui/react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Lead from "../components/lead";
import { CountryOption, LeadItem } from "../types/lead";

export default function LeadsPage() {
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<LeadItem[] | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [error, setError] = useState("");

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
    setLeads(Array.isArray(payload?.leads) ? payload.leads : []);
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
        setError("Неверный пароль");
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
  };

  if (isLoading) {
    return (
      <VStack py="20">
        <Spinner />
      </VStack>
    );
  }

  if (!leads) {
    return (
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
    );
  }

  return (
    <VStack align="stretch" px="4" py="6" spacing="4">
      <Box display="flex" alignItems="center" justifyContent="space-between" gap="3">
        <Heading size="md">Leads ({leads.length})</Heading>
        <Button variant="outline" onClick={onLogout}>
          Выйти
        </Button>
      </Box>

      {error ? <Text color="red.500">{error}</Text> : null}

      <VStack align="stretch" spacing="4">
        {leads.map((lead) => (
          <Lead key={lead.id} lead={lead} countries={countries} />
        ))}
      </VStack>
    </VStack>
  );
}
