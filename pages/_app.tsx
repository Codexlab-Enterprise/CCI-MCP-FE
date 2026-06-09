import type { AppProps } from "next/app";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { NuqsAdapter } from "nuqs/adapters/next/pages";

import { fontSans, fontMono } from "@/config/fonts";

import "@/styles/globals.css";
import { Toaster } from "sonner";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      <NuqsAdapter>
        <Component {...pageProps} />
      </NuqsAdapter>
      <Toaster richColors />
    </NextThemesProvider>
  );
}

export const fonts = {
  sans: fontSans.style.fontFamily,
  mono: fontMono.style.fontFamily,
};
