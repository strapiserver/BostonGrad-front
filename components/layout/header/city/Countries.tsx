import { Grid, Box } from "@chakra-ui/react";
import React from "react";
import { initParserFetcher } from "../../../../services/fetchers";
import useSWR from "swr";
import { ISelectorCountry } from "../../../../types/city";
import ErrorWrapper from "../../../shared/ErrorWrapper";
import Country from "./Country";
import { useAppSelector } from "../../../../redux/hooks";

export default function Countries({ pageType }: { pageType?: string }) {
  const fetcher = initParserFetcher();
  const dir = useAppSelector((state) => {
    if (pageType !== "cash") return undefined;
    const [givePm, getPm] = [state.main.givePm, state.main.getPm];
    if (givePm && getPm) return `${givePm.code}_${getPm.code}`;
    return undefined;
  });
  const { data, error } = useSWR(
    dir ? `city_selector=${dir}` : "city_selector",
    fetcher
  ) as {
    data: ISelectorCountry[];
    error: boolean;
  };

  return (
    <ErrorWrapper isError={error} isLoading={!data}>
      <Box p="2">
        {data &&
          data.map((country, index) => (
            <Country
              pageType={pageType}
              key={country.en_country_name}
              country={country}
              dir={dir}
            />
          ))}
      </Box>
    </ErrorWrapper>
  );
}
