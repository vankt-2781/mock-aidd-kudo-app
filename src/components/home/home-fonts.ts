import { Montserrat, Montserrat_Alternates } from "next/font/google";

/** Montserrat is the design font for all homepage text (mm: Figma text styles). */
export const montserrat = Montserrat({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

/** Used only by the footer copyright line. */
export const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
  variable: "--font-montserrat-alternates",
  display: "swap",
});
