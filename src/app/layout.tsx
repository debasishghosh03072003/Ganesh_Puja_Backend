import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ganesh Puja Committee Admin Panel",
  description: "Private Ganesh Puja Committee Management System 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-festive-cream min-h-screen font-sans text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
