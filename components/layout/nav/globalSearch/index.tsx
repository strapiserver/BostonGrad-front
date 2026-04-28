"use client";

import { useState } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  useColorModeValue,
  Tooltip,
  useBreakpointValue,
  HStack,
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/react";
import { BiSearch, BiX, BiStore, BiMap, BiTransfer } from "react-icons/bi";
import useSWR from "swr";
import NavButton from "../NavButton";
import { Box3D } from "../../../../styles/theme/custom";
import { useRouter } from "next/router";
import { filterSearchResults } from "./helper";
import Transliterator from "../../../../services/transliterator";
import Loader from "../../../shared/Loader";
const transliterator = new Transliterator();

const fetcher = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};

const GlobalSearch = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const color = useColorModeValue("violet.700", "violet.600");
  const expandedWidth = useBreakpointValue({ base: 240, md: 400 }) || 400;

  const { data, error } = useSWR(open ? "/api/search-index" : null, fetcher, {
    revalidateOnFocus: false,
  });

  const isLoading = !data && !error;
  const entries = data?.data || [];

  let results = filterSearchResults(entries, value).slice(0, 10);

  if (results.length === 0 && value.trim()) {
    results = entries
      .filter((e: any) =>
        transliterator.findMatch(e.header, value.toLowerCase())
      )
      .slice(0, 10);
  }

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setValue("");
  };

  const renderResult = (r: any) => {
    const isExchanger = r.slug?.startsWith("exchangers/");
    const isCity = r.slug?.startsWith("map/");
    const text =
      r.header.length > 32 ? r.header.slice(0, 32) + "..." : r.header;
    const Icon = isExchanger ? BiStore : isCity ? BiMap : BiTransfer;

    return (
      <HStack spacing="2" alignItems="center">
        <Icon size="1rem" />
        <Box>{text}</Box>
      </HStack>
    );
  };

  return (
    <Popover
      isOpen={open && !!value}
      onClose={handleClose}
      placement="bottom-start"
      closeOnBlur
      autoFocus={false}
      matchWidth
      gutter={8}
    >
      <PopoverAnchor>
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          zIndex={100}
        >
          {!open ? (
            <NavButton handleClick={handleOpen} icon={BiSearch} />
          ) : (
            <Box3D
              w={expandedWidth}
              boxShadow="lg"
              borderRadius="xl"
              variant="contrast"
            >
              <InputGroup size="sm" borderRadius="2xl">
                <Input
                  h="10"
                  color={color}
                  border="none"
                  placeholder="Поиск направления, обменника или города"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoFocus
                  _placeholder={{ color: "bg.800" }}
                />
                <InputRightElement borderRadius="50%">
                  <IconButton
                    mt="2"
                    aria-label="Close search"
                    icon={<BiX />}
                    variant="ghost"
                    size="lg"
                    borderRadius="50%"
                    onClick={handleClose}
                  />
                </InputRightElement>
              </InputGroup>
            </Box3D>
          )}
        </Box>
      </PopoverAnchor>

      <PopoverContent
        bgColor="bg.800"
        borderRadius="md"
        boxShadow="lg"
        maxH="200px"
        overflowY="auto"
        p="2"
        minW={{ base: "90vw", md: "400px" }}
        w={{ base: "90vw", md: `${expandedWidth}px` }}
      >
        <PopoverBody p="0">
          {isLoading ? (
            <Box textAlign="center" py="4">
              <Loader size="sm" />
            </Box>
          ) : results.length > 0 ? (
            results.map((r: any) => (
              <Box
                key={r.slug}
                p="2"
                bgColor="bg.800"
                borderRadius="md"
                _hover={{ bg: "bg.900", cursor: "pointer" }}
                onClick={() => {
                  router.push("/" + r.slug);
                  handleClose();
                }}
              >
                <Tooltip
                  openDelay={500}
                  hasArrow
                  bg={"bg.500"}
                  placement="top"
                  size="sm"
                  fontSize="sm"
                  label={r.header}
                  color="bg.100"
                >
                  {renderResult(r)}
                </Tooltip>
              </Box>
            ))
          ) : (
            <Box textAlign="center" py="2" color="bg.300">
              Ничего не найдено
            </Box>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default GlobalSearch;
