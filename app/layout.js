import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata = {
  title: "GatorGreen — Discover Green Spaces Near You",
  description:
    "Explore parks, trails, and gardens in Gainesville. GatorGreen connects you to the natural world just outside your door.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable}`}>
      <body className="bg-stone-50 text-green-950 antialiased">
        {children}
      </body>
    </html>
  );
}