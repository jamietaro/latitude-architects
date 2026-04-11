import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Latitude Architects",
  description:
    "Latitude Architects and Designers Ltd is a RIBA Chartered architectural practice founded in 2000.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.className}>
      <body className="min-h-screen public-site">
        <div className="page-transition">{children}</div>
      </body>
    </html>
  );
}
