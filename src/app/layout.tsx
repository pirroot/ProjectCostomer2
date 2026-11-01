import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Visual Storytelling — Portfolio",
    template: "%s — Visual Storytelling",
  },

  description:
    "Personal photography portfolio: projects, galleries and contact. Built with Next.js.",

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${lato.variable} antialiased bg-white text-neutral-900 font-[family-name:var(--font-lato)]`}
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
