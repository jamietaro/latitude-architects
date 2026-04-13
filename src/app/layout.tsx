import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://latitudearchitects.com"),
  title: {
    default: "Latitude Architects | Award-Winning London Architectural Practice",
    template: "%s | Latitude Architects",
  },
  description:
    "Latitude Architects is a RIBA Chartered practice founded in 2000, specialising in heritage buildings, high-end residential, and complex commercial projects across central London.",
  openGraph: {
    siteName: "Latitude Architects",
    locale: "en_GB",
    type: "website",
    images: [
      {
        url: "/images/logo-dark.png",
        width: 800,
        height: 200,
        alt: "Latitude Architects",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
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
