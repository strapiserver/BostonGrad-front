import { Button, Collapse, Divider, Grid, Text } from "@chakra-ui/react";
import { useState } from "react";
import { CityCashEntry } from "../types";
import { BoxWrapper, CustomHeader } from "../../shared/BoxWrapper";
import { IPm } from "../../../types/selector";
import { RiExchangeFill } from "react-icons/ri";
import Arrow from "../../shared/Arrow";
import Dir from "../../exchange/Dir";
import useSWR from "swr";
import { initParserFetcher } from "../../../services/fetchers";
import { buildRateString } from "../../shared/helper";

type SectionEntriesProps = {
  title: string;
  entries: CityCashEntry[];
  cashPm: IPm;
  direction: "buy" | "sell";
  cityName: string;
};

const SectionEntries = ({
  title,
  entries,
  cashPm,
  direction,
  cityName,
}: SectionEntriesProps) => {
  const [showAll, setShowAll] = useState(false);
  const fetcher = initParserFetcher();
  if (!entries.length) return null;
  const visibleEntries = entries.slice(0, 6);
  const hiddenEntries = entries.slice(6);
  const normalizedCity = cityName?.toLowerCase();
  const cityQuery = normalizedCity
    ? `?city=${encodeURIComponent(normalizedCity)}`
    : "";

  const dirs = entries.map((entry) =>
    direction === "sell"
      ? `${entry.cryptoPm.code}_${cashPm.code}`
      : `${cashPm.code}_${entry.cryptoPm.code}`
  );

  const { data } = useSWR(
    dirs.length ? `similar/dirs=${dirs.join(",")}${cityQuery}` : null,
    fetcher
  ) as { data: ([number, number] | [])[] | undefined };

  const renderRate = (
    entry: CityCashEntry,
    rateEntry?: [number, number] | []
  ) => {
    const [course, amountOfCourses] = rateEntry || [];
    if (!course) return null;

    const [giveCur, getCur] =
      direction === "sell"
        ? [
            entry.cryptoPm.currency.code.toUpperCase(),
            cashPm.currency.code.toUpperCase(),
          ]
        : [
            cashPm.currency.code.toUpperCase(),
            entry.cryptoPm.currency.code.toUpperCase(),
          ];

    return {
      amountOfCourses,
      rateText: buildRateString({ course, giveCur, getCur }),
    };
  };

  const renderDir = (entry: CityCashEntry, index: number) => {
    const givePm = direction === "sell" ? entry.cryptoPm : cashPm;
    const getPm = direction === "sell" ? cashPm : entry.cryptoPm;
    const slug = `${entry.slug}-in-${normalizedCity}`;
    const rateData = renderRate(entry, data?.[index]);

    return (
      <Dir
        key={entry.slug}
        fullHeight
        givePm={givePm}
        getPm={getPm}
        slug={slug}
        bottomLeft={
          <Text fontSize="sm" whiteSpace="nowrap" variant="no_contrast" mt="1">
            {`Предложений: ${rateData?.amountOfCourses ?? entry.count}`}
          </Text>
        }
        bottomRight={
          rateData ? (
            <Text
              whiteSpace="nowrap"
              fontSize="sm"
              variant="no_contrast"
              textAlign="start"
              mt="1"
            >
              {rateData.rateText}
            </Text>
          ) : (
            <Text
              whiteSpace="nowrap"
              fontSize="sm"
              variant="no_contrast"
              textAlign="start"
              mt="1"
              visibility="hidden"
            >
              placeholder
            </Text>
          )
        }
      />
    );
  };

  return (
    <BoxWrapper>
      <CustomHeader text={title} as="h3" Icon={RiExchangeFill} />
      <Divider my="4" />

      <Grid gap="4" gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }}>
        {visibleEntries.map((entry, index) => renderDir(entry, index))}
      </Grid>
      {hiddenEntries.length > 0 && (
        <>
          <Collapse in={showAll} animateOpacity>
            <Grid
              gap="4"
              gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }}
              mt="4"
            >
              {hiddenEntries.map((entry, index) =>
                renderDir(entry, visibleEntries.length + index)
              )}
            </Grid>
          </Collapse>
          <Button
            mt="4"
            color="bg.700"
            w="100%"
            bgColor="bg.700"
            onClick={() => setShowAll((prev) => !prev)}
            rightIcon={<Arrow isUp={showAll} />}
          >
            {showAll ? "Скрыть" : "Показать все"}
          </Button>
        </>
      )}
    </BoxWrapper>
  );
};

export default SectionEntries;
