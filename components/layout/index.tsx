import React, { useEffect } from "react";
import Header from "./header";
import Footer from "./footer";
import {
  useToast,
  Box,
  VStack,
  useColorModeValue,
  Progress,
  Divider,
} from "@chakra-ui/react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { batch } from "react-redux";
import {
  setCity,
  setIP,
  setFingerprintHash,
  setUserAgent,
  setCurrencyConverterRate,
} from "../../redux/mainReducer";
import { initCurrencyConverterFetcher } from "../../services/fetchers";
import { ICity } from "../../types/exchange";
import { useRouter } from "next/router";
import Fingerprint from "fingerprinter-js";

const Layout = ({ children }: { children: any }) => {
  // const maxW = useBreakpointValue({ base: "100%", lg: "980" });
  //const isScrollLocked = useAppSelector((state) => state.main.isScrollLocked);
  const myToast = useAppSelector((state) => state.main?.toast);
  const toast = useToast();
  const { asPath } = useRouter();
  const lastString = asPath.split("/")[asPath.split("/").length - 1];
  const isCash =
    lastString.startsWith("cash-") || lastString.includes("-cash-");
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CONVERTER_URL) {
      return;
    }

    const fetcher = initCurrencyConverterFetcher();
    fetcher().then((resp) => {
      if (resp.data) {
        const { ip, BTC_RUB, ...cityData } = resp.data as any;

        batch(() => {
          !isCash && cityData?.city && dispatch(setCity(cityData.city));
          dispatch(setIP(ip));
          dispatch(setCurrencyConverterRate(BTC_RUB));
        });
      }
    });
    Fingerprint.generate()
      .then((res) => {
        batch(() => {
          dispatch(setFingerprintHash(res.fingerprint));
          dispatch(setUserAgent(res.components.userAgent));
        });
      })
      .catch((error) => {
        console.error("Failed to generate fingerprint", error);
      });
  }, []);

  useEffect(() => {
    if (!myToast.title) return;
    const { timeBeforeClosing, ...toastConfig } = myToast;
    toast({
      ...toastConfig,
      duration: timeBeforeClosing,
      isClosable: true,
    });
  }, [myToast, toast]);

  const loadingStatus = useAppSelector((state) => state.main.loading);
  const ambientColor = useColorModeValue(
    "rgba(143,92,292,0.2)",
    "rgba(247, 197, 177, 0.1)",
  );

  return (
    <Box // careful! populars may stop working!
      overflowX="hidden"
      w="100%"
      position="relative"
      fontFamily="Rubik, sans-serif"
      sx={{
        "&::WebkitScrollbar": {
          width: "0",
        },
        "&::WebkitOverflowScrolling": "touch",
      }}
    >
      <Header />

      {loadingStatus === "pending" && (
        <Progress
          size="xs"
          isIndeterminate
          colorScheme="peach"
          filter="opacity(0.2)"
          position="fixed"
          top="0"
          left="0"
          right="0"
          zIndex="popover"
        />
      )}
      <VStack
        alignItems="center"
        justifyContent="space-between"
        gap="4"
        minH="calc(100vh - 56px)"
      >
        <Box maxW={{ base: "100%", md: "1066px" }} w="100%">
          {children}
        </Box>
      </VStack>

      <Box
        mt="100px"
        bgColor="bg.1000"
        pt="50px"
        dropShadow="lg"
        pos="relative"
        zIndex="1"
      >
        <Footer />
        <Box
          bgGradient="linear(to-t, rgba(0,0,0,0.3), transparent 60%)"
          h="60px"
        />
      </Box>
      <Box
        position="absolute"
        inset={0}
        zIndex={0}
        mt="auto"
        h="500px"
        mb={{ base: "50%", lg: "2%" }}
        pointerEvents="none" // <-- lets all clicks/touches pass through
        bgGradient={{
          base: `linear(to-t, ${ambientColor} 10%, transparent 65%)`,
          lg: `radial-gradient(ellipse at 50% 50%, ${ambientColor} 10%, transparent 65%)`,
        }}
      />
    </Box>
  );
};

export default Layout;
