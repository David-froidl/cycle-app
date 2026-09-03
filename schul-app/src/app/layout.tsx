import type { Metadata } from "next";
import { NavBar } from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Schule",
  description: "Stundenplan, Abgaben und Lernpläne auf einen Blick.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full font-sans">
        <NavBar />
        <main className="mx-auto max-w-xl px-5 py-10">{children}</main>
      </body>
    </html>
  );
}
