import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: false,
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const handleStart = (url: string) => {
      if (url !== router.asPath) {
        NProgress.start();
      }
    };

    const handleComplete = () => {
      NProgress.done();
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return <Component {...pageProps} />;
}
