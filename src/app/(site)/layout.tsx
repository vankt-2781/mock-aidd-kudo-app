import type { Metadata } from "next";
import { Suspense } from "react";

import { montserrat, montserratAlternates } from "@/components/home/home-fonts";

import { HomeFooterSection, HomeHeaderSection } from "./home-site-sections";

export const metadata: Metadata = {
  title: "Sun* Annual Awards 2025",
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    // mm:2167:9026
    <div
      className={`${montserrat.variable} ${montserratAlternates.variable} ${montserrat.className} relative flex flex-1 flex-col overflow-x-clip bg-[#00101A] text-white`}
    >
      {/* Fallback keeps the sticky bar's height so content does not shift when it streams in. */}
      <Suspense fallback={<div className="h-20" aria-hidden />}>
        <HomeHeaderSection />
      </Suspense>
      {children}
      <Suspense>
        <HomeFooterSection />
      </Suspense>
    </div>
  );
}
