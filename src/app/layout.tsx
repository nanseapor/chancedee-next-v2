import "./globals.css";

import { ToastProvider } from "@/hooks/use-toast-notification";
import { getGlobalMetadata } from "@/lib/directus";
import { cn } from "@/lib/utils";
import { chancedeeStore } from "@/store/atom-store";
import { Provider } from "jotai";
import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import { headers } from "next/headers";
import Script from "next/script";

const fontSans = Kanit({
  variable: "--font-sans",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const fontHeading = Kanit({
  variable: "--font-heading",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get("host") || "www.chancedee.com";
  const global = await getGlobalMetadata(hostname);
  return global;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-F5K8X9P5MH"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-F5K8X9P5MH');
          `}
        </Script>
      </head>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          fontSans.variable,
          fontHeading.variable,
        )}
      >
        <Provider store={chancedeeStore}>
          <ToastProvider>{children}</ToastProvider>
        </Provider>
      </body>
    </html>
  );
}
