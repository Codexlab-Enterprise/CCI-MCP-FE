import type { AppProps } from "next/app";

import { HeroUIProvider } from "@heroui/system";
import { I18nProvider } from "@react-aria/i18n";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

import { fontSans, fontMono } from "@/config/fonts";

import "@/styles/globals.css";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HeroUIProvider>
      <I18nProvider locale="en-GB">
        <NextThemesProvider attribute="class" defaultTheme="light">
          <NuqsAdapter>
            <Component {...pageProps} />
          </NuqsAdapter>
          <Toaster richColors />
        </NextThemesProvider>
      </I18nProvider>
    </HeroUIProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
