import type { AppProps } from "next/app";

import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/router";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

import { fontSans, fontMono } from "@/config/fonts";

import "@/styles/globals.css";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  return (
    <HeroUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="light">
        <NuqsAdapter>
          <Component {...pageProps} />
        </NuqsAdapter>
        <Toaster richColors />
      </NextThemesProvider>
    </HeroUIProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
