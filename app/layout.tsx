import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FixNow – Dienstleister sofort finden",
  description: "Foto hochladen, Problem beschreiben, sofort Angebote erhalten. Der schnellste Weg zum richtigen Handwerker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col bg-gray-50">{children}</body>
    </html>
  );
}
