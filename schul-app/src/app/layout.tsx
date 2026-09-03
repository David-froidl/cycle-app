import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Schule",
  description: "Stundenplan, Abgaben und Lernpläne auf einen Blick.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${inter.variable} h-full`}>
      <body className="min-h-full">
        <NavBar />
        <main className="mx-auto max-w-xl px-5 py-6">{children}</main>
      </body>
    </html>
  );
}
