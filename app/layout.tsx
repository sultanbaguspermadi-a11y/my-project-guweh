import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource/amiri/400.css";
import "@fontsource/amiri/700.css";
import "@fontsource/noto-nastaliq-urdu/400.css";
import "./globals.css";
import { Providers } from "@/components/ui/Providers";

const site =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

const title = "Sultan’s Project Playground";
const description = "A small interactive playground featuring Arabic Scrabble and Lughoti Vokasi.";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title,
  description,
  openGraph: { title, description, type: "website", siteName: title },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ece5d0" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#scrabble" className="skip">Skip to the games</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
