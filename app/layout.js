import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SupportButton } from "@/components/SupportButton";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: "AddMe — Share your WhatsApp in style",
  description:
    "Create a beautiful WhatsApp card with your photo, name, and bio. Share it anywhere and let people add you instantly.",
  openGraph: {
    title: "AddMe — Share your WhatsApp in style",
    description: "Create a beautiful WhatsApp card. Share it, get added instantly.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${inter.variable} antialiased min-h-screen`}>
        <ThemeProvider>
          <ThemeToggle />
          <SupportButton />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
