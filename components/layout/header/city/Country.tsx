import React, { useState } from "react";
import { ISelectorCountry } from "../../../../types/city";
import { Box, Text, Collapse, Grid } from "@chakra-ui/react";


import City from "./City";

export default function Country({
  country,
  dir,
  pageType,
}: {
  country: ISelectorCountry;
  dir?: string;
  pageType?: string;
}) {
  return (
    <>
      <Text
        my="1"
        p="1"
        fontWeight={"bold"}
        fontSize={"4xl"}
        variant={"extra_contrast"}
        cursor="pointer"
      >
        {(country.ru_country_name || country.en_country_name) + ":"}
      </Text>
      <Grid gridTemplateColumns="1fr  1fr" mt="2" p="2">
        {[...country.cities]
          .sort((a, b) =>
            (a.ru_name || a.en_name).localeCompare(b.ru_name || b.en_name)
          )
          .map((city) => {
            // const popularCityName =
            // city.en_name.toLowerCase() as keyof typeof popularCityNames;
            // const country.weight = popularCityNames?.[popularCityName] || "";
            // const selected = highlightedCities.find((c) => c == city.en_name);

            //const bullet = !isMultiple ? "" : selected ? "•" : "◦";
            return (
              <City
                key={city.en_name}
                city={city}
                dir={dir}
                pageType={pageType}
              />
            );
          })}
      </Grid>
    </>
  );
}
