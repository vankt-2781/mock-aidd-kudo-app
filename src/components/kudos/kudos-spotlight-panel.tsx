"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { KUDOS_LOGIN_HREF } from "@/lib/auth/return-to";
import { formatKudosTime } from "@/lib/kudos/kudos-derivations";
import type { SpotlightData } from "@/lib/kudos/kudos-board-types";
import type { KudosMessages } from "@/lib/i18n/kudos-dictionary";
import { IconExpand, IconSearch } from "./kudos-icons";
import { KudosSpotlightCanvas, type SpotlightMode } from "./kudos-spotlight-canvas";
import { KudosSpotlightTooltip } from "./kudos-spotlight-tooltip";
import { matchesSpotlightSearch } from "./spotlight-search-match";
import { FULL_VIEWBOX, type Canvas } from "./spotlight-viewbox";
import { layoutWordCloud } from "./spotlight-word-cloud-layout";

export interface KudosSpotlightPanelProps {
  data: SpotlightData;
  messages: KudosMessages["spotlight"];
  signedIn: boolean;
}

/** Design canvas (1157x548) — the SVG base viewBox. */
const CANVAS: Canvas = { width: 1157, height: 548 };
const pctX = (x: number) => `${(x / CANVAS.width) * 100}%`;
const pctY = (y: number) => `${(y / CANVAS.height) * 100}%`;
const cqw = (px: number) => `${(px / CANVAS.width) * 100}cqw`;

/** B.7 Spotlight panel: interactive word cloud (pan/zoom, tooltip, search) over the keyvisual. */
export function KudosSpotlightPanel({ data, messages, signedIn }: KudosSpotlightPanelProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SpotlightMode>("pan");
  const [viewBox, setViewBox] = useState(() => FULL_VIEWBOX(CANVAS));
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const words = useMemo(
    () => layoutWordCloud(data.nodes.map((n) => ({ id: n.profileId, name: n.name, count: n.kudosCount })), CANVAS),
    [data.nodes],
  );
  const nodesById = useMemo(() => new Map(data.nodes.map((n) => [n.profileId, n])), [data.nodes]);
  const matches = useMemo(
    () => new Map(words.map((w) => [w.id, matchesSpotlightSearch(w.name, query)])),
    [words, query],
  );
  const hrefFor = (id: string) => {
    const node = nodesById.get(id);
    return signedIn && node ? `/kudos/${node.latestKudosId}` : KUDOS_LOGIN_HREF;
  };
  const hoveredWord = words.find((w) => w.id === hoveredId);
  const hoveredNode = hoveredId ? nodesById.get(hoveredId) : undefined;

  return (
    // mm:2940:14174 — below md the canvas keeps a 720px minimum and scrolls horizontally
    <div className="w-full overflow-x-auto rounded-[47px]">
      <div
        className="relative isolate min-w-[720px] overflow-hidden rounded-[47px] border border-[#998C5F] bg-[#00070C] [container-type:inline-size]"
        style={{ aspectRatio: `${CANVAS.width} / ${CANVAS.height}` }}
      >
        {/* mm:2940:14173 — background art + 70% black overlay */}
        <Image src="/images/home/keyvisual-bg.png" alt="" fill sizes="1157px" className="-z-10 object-cover object-[0%_100%]" aria-hidden />
        <div
          className="absolute inset-0 -z-10 bg-black/75 [background-image:radial-gradient(ellipse_120%_100%_at_80%_20%,#00070C_40%,rgba(0,7,12,0)_100%)]"
          aria-hidden
        />

        {data.nodes.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center text-white/70">{messages.empty}</p>
        ) : (
          <KudosSpotlightCanvas
            canvas={CANVAS}
            words={words}
            viewBox={viewBox}
            setViewBox={setViewBox}
            mode={mode}
            matches={matches}
            hrefFor={hrefFor}
            onHover={setHoveredId}
          />
        )}

        {/* mm:3007:17482 */}
        <p
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-bold text-white"
          style={{ top: pctY(14), fontSize: "max(24px, 3.11cqw)", lineHeight: 1.22 }}
        >
          {data.total} {messages.totalSuffix}
        </p>

        {/* mm:2940:14833 */}
        <label
          className="absolute flex items-center gap-[5px] rounded-full border border-[#998C5F] bg-[#FFEA9E]/10 px-[11px] focus-within:outline-2 focus-within:outline-[#FFEA9E]"
          style={{ left: pctX(25), top: pctY(26), width: pctX(219), height: pctY(39) }}
        >
          <IconSearch className="size-4 shrink-0 text-white" />
          <input
            type="search"
            value={query}
            maxLength={100}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={messages.searchPlaceholder}
            aria-label={messages.searchPlaceholder}
            className="min-w-0 flex-1 bg-transparent text-[11px] font-medium leading-4 tracking-[0.1px] text-white outline-none placeholder:text-white"
          />
        </label>

        {hoveredWord && hoveredNode && (
          <KudosSpotlightTooltip word={hoveredWord} receivedAtLabel={formatKudosTime(hoveredNode.latestReceivedAt)} viewBox={viewBox} />
        )}

        {/* live activity, fading in towards the newest line (opacity ramp 0.1 → 1) */}
        <ul
          className="pointer-events-none absolute m-0 flex list-none flex-col p-0 font-bold text-white"
          style={{ left: pctX(49), top: pctY(410), fontSize: cqw(14), lineHeight: cqw(19) }}
          aria-label={messages.activityLabel}
        >
          {data.activity.map((item, i) => (
            <li key={item.id} style={{ opacity: 0.1 + (0.9 * i) / Math.max(data.activity.length - 1, 1) }}>
              <span className="mr-[0.35em] opacity-60">{item.time}</span>
              {item.text}
            </li>
          ))}
        </ul>

        {/* mm:3007:17479 */}
        <button
          type="button"
          aria-label={messages.panZoomLabel}
          aria-pressed={mode === "zoom"}
          title={mode === "zoom" ? messages.zoomMode : messages.panMode}
          onClick={() => setMode((m) => (m === "pan" ? "zoom" : "pan"))}
          className={`absolute flex size-[30px] cursor-pointer items-center justify-center rounded text-white transition-colors duration-200 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-[#FFEA9E] ${mode === "zoom" ? "bg-white/20" : ""}`}
          style={{ left: pctX(1089), top: pctY(471) }}
        >
          <IconExpand className="size-5" />
        </button>
      </div>
    </div>
  );
}
