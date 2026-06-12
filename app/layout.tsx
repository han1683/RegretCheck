import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RegretCheck",
  description: "Check how your caption could be perceived before it goes live.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
