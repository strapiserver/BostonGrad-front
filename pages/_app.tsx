import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Box, ChakraProvider, Spinner } from "@chakra-ui/react";
import theme from "../styles/theme";
import Layout from "../components/layout";
import store from "../redux/store";
import { Provider } from "react-redux";
import { DefaultSeo } from "next-seo";
import { useRouter } from "next/router";
import { defaultConfig } from "../next-seo.config";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "../redux/hooks";
import { setLoadingStatus } from "../redux/mainReducer";

const RouteLoadingHandler = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExchangePath = (path: string) => {
    const cleanPath = path.split("?")[0].split("#")[0];
    const parts = cleanPath.split("/").filter(Boolean);
    if (parts.length !== 1) return false;
    const reserved = new Set([
      "about",
      "articles",
      "contacts",
      "exchangers",
      "faq",
      "map",
    ]);
    return !reserved.has(parts[0]);
  };

  useEffect(() => {
    const handleStart = (url: string) => {
      if (isExchangePath(router.asPath) && isExchangePath(url)) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      dispatch(setLoadingStatus("pending"));

      timeoutRef.current = setTimeout(() => {
        dispatch(setLoadingStatus("fulfilled"));
        timeoutRef.current = null;
      }, 10000);
    };

    const handleFinish = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      dispatch(setLoadingStatus("fulfilled"));
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleFinish);
    router.events.on("routeChangeError", handleFinish);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleFinish);
      router.events.off("routeChangeError", handleFinish);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [router.events, dispatch]);

  return null;
};

const lightOnlyColorModeManager = {
  type: "localStorage" as const,
  get: () => "light",
  set: () => {},
};

const RouteLoadingOverlay = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExchangePath = (path: string) => {
    const cleanPath = path.split("?")[0].split("#")[0];
    const parts = cleanPath.split("/").filter(Boolean);
    if (parts.length !== 1) return false;
    const reserved = new Set([
      "about",
      "articles",
      "contacts",
      "exchangers",
      "faq",
      "map",
    ]);
    return !reserved.has(parts[0]);
  };

  useEffect(() => {
    const show = () => {
      setMounted(true);
      setActive(true);
    };

    const hide = () => {
      setActive(false);
      if (unmountRef.current) clearTimeout(unmountRef.current);
      unmountRef.current = setTimeout(() => {
        setMounted(false);
        unmountRef.current = null;
      }, 200);
    };

    const handleStart = (url: string) => {
      if (isExchangePath(router.asPath) && isExchangePath(url)) return;
      show();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        hide();
        timeoutRef.current = null;
      }, 10000);
    };

    const handleFinish = () => {
      hide();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleFinish);
    router.events.on("routeChangeError", handleFinish);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleFinish);
      router.events.off("routeChangeError", handleFinish);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (unmountRef.current) {
        clearTimeout(unmountRef.current);
        unmountRef.current = null;
      }
    };
  }, [router.events]);

  if (!mounted) return null;

  return (
    <Box
      position="fixed"
      inset="0"
      bg="rgba(0, 0, 0, 0.6)"
      zIndex="overlay"
      display="flex"
      alignItems="center"
      justifyContent="center"
      opacity={active ? 1 : 0}
      transition="opacity 200ms ease"
    >
      <Spinner
        thickness="4px"
        speed="0.75s"
        emptyColor="rgba(255,255,255,0.22)"
        color="#f6d894"
        boxSize="56px"
      />
    </Box>
  );
};

function MyApp({ Component, pageProps }: AppProps) {
  const seoConfig = defaultConfig;

  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </Head>
      <ChakraProvider
        theme={theme}
        colorModeManager={lightOnlyColorModeManager as any}
      >
        <Provider store={store}>
          <Layout>
            <RouteLoadingHandler />
            <RouteLoadingOverlay />
            <DefaultSeo {...seoConfig} />
            <Component {...pageProps} />
          </Layout>
        </Provider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
