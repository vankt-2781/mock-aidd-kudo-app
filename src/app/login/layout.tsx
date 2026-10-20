import type { Metadata } from "next";
import { Montserrat, Montserrat_Alternates } from "next/font/google";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
});

const montserratAlternates = Montserrat_Alternates({
  variable: "--font-montserrat-alternates",
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Login | Sun* Annual Awards 2025",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${montserrat.variable} ${montserratAlternates.variable} contents`}>
      {children}
    </div>
  );
}
