import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // ✅ This works here because globals.css is in src/app/
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Velora Salon Management",
  description: "Admin Dashboard for Velora Salon",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}