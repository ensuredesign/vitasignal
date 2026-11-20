import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VitaSignal AI — Preventive Reproductive Health Intelligence",
  description: "Privacy-first, evidence-grounded decision support connecting male reproductive signals with safe clinical pathways.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-offwhite text-navy-800 antialiased selection:bg-teal-100 selection:text-teal-700">
        {children}
      </body>
    </html>
  );
}
