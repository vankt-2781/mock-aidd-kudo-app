import { Montserrat } from "next/font/google";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "vietnamese"],
  weight: ["700"],
});

export default function CountdownLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${montserrat.variable} contents`}>{children}</div>;
}
