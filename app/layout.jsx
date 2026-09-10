import "./globals.css";
import { Overpass, Bebas_Neue } from "next/font/google";
import PwaRegister from "../components/PwaRegister";

const overpass = Overpass({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: "400",
});

export const metadata = {
  title: "BDO Gewinnspiel",
  description: "Berlin Dance Open – Gewinnspiel-Ziehung",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#1A1A1A",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body
        className={`${overpass.variable} ${bebas.variable} font-body bg-ink text-paper min-h-screen antialiased`}
      >
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
